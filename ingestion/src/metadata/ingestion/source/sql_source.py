import logging
import uuid
from abc import abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple, Type

from pydantic import ValidationError

from metadata.generated.schema.entity.services.databaseService import DatabaseServiceType
from metadata.ingestion.models.ometa_table_db import OMetaDatabaseAndTable

from metadata.generated.schema.type.entityReference import EntityReference

from metadata.generated.schema.entity.data.database import DatabaseEntity

from metadata.generated.schema.entity.data.table import TableEntity, Column, ColumnConstraint
from sqlalchemy import create_engine
from sqlalchemy.sql import sqltypes as types
from sqlalchemy.inspection import inspect

from metadata.ingestion.api.common import IncludeFilterPattern, ConfigModel, Record
from metadata.ingestion.api.common import WorkflowContext
from metadata.ingestion.api.source import Source, SourceStatus
from metadata.ingestion.ometa.auth_provider import MetadataServerConfig
from metadata.utils.helpers import get_service_or_create

logger: logging.Logger = logging.getLogger(__name__)


@dataclass
class SQLSourceStatus(SourceStatus):
    tables_scanned: List[str] = field(default_factory=list)
    filtered: List[str] = field(default_factory=list)

    def report_table_scanned(self, table_name: str) -> None:
        self.tables_scanned.append(table_name)
        logger.info('Table Scanned: {}'.format(table_name))

    def report_dropped(self, table_name: str, err: str, dataset_name: str = None, col_type: str = None) -> None:
        self.filtered.append(table_name)
        logger.error("Dropped Table {} due to {}".format(dataset_name, err))
        logger.error("column type {}".format(col_type))


class SQLAlchemyConfig(ConfigModel):
    env: str = "PROD"
    options: dict = {}
    schema_pattern: IncludeFilterPattern = IncludeFilterPattern.allow_all()
    table_pattern: IncludeFilterPattern = IncludeFilterPattern.allow_all()

    @abstractmethod
    def get_sql_alchemy_url(self):
        pass

    def get_identifier(self, schema: str, table: str) -> str:
        return f"{schema}.{table}"

    def standardize_schema_table_names(
            self, schema: str, table: str
    ) -> Tuple[str, str]:
        # Some SQLAlchemy dialects need a standardization step to clean the schema
        # and table names. See BigQuery for an example of when this is useful.
        return schema, table


class BasicSQLAlchemyConfig(SQLAlchemyConfig):
    username: Optional[str] = None
    password: Optional[str] = None
    host_port: str
    database: Optional[str] = None
    scheme: str
    service_name: str
    service_type: str

    def get_sql_alchemy_url(self):
        url = f"{self.scheme}://"
        if self.username:
            url += f"{self.username}"
            if self.password:
                url += f":{self.password}"
            url += "@"
        url += f"{self.host_port}"
        if self.database:
            url += f"/{self.database}"
        return url

    def get_service_type(self) -> DatabaseServiceType:
        return DatabaseServiceType[self.service_type]


_field_type_mapping: Dict[Type[types.TypeEngine], str] = {
    types.Integer: "INT",
    types.Numeric: "INT",
    types.Boolean: "BOOLEAN",
    types.Enum: "ENUM",
    types._Binary: "BYTES",
    types.LargeBinary: "BYTES",
    types.PickleType: "BYTES",
    types.ARRAY: "ARRAY",
    types.VARCHAR: "VARCHAR",
    types.String: "STRING",
    types.Date: "DATE",
    types.DATE: "DATE",
    types.Time: "TIME",
    types.DateTime: "DATETIME",
    types.DATETIME: "DATETIME",
    types.TIMESTAMP: "TIMESTAMP",
    types.NullType: "NULL",
    types.JSON: "JSON"
}

_known_unknown_field_types: Set[Type[types.TypeEngine]] = {
    types.Interval,
    types.CLOB,
}


def register_custom_type(
        tp: Type[types.TypeEngine], output: str = None
) -> None:
    if output:
        _field_type_mapping[tp] = output
    else:
        _known_unknown_field_types.add(tp)


def get_column_type(sql_report: SQLSourceStatus, dataset_name: str, column_type: Any) -> str:
    type_class: Optional[str] = None
    for sql_type in _field_type_mapping.keys():
        if isinstance(column_type, sql_type):
            type_class = _field_type_mapping[sql_type]
            break
    if type_class is None:
        for sql_type in _known_unknown_field_types:
            if isinstance(column_type, sql_type):
                type_class = "NULL"
                break

    if type_class is None:
        sql_report.warning(
            dataset_name, f"unable to map type {column_type!r} to metadata schema"
        )
        type_class = "NULL"

    return type_class


class SQLAlchemySource(Source):

    def __init__(self, config: SQLAlchemyConfig, metadata_config: MetadataServerConfig,
                 ctx: WorkflowContext, connector: str = None):
        super().__init__(ctx)
        self.config = config
        self.metadata_config = metadata_config
        self.service = get_service_or_create(config, metadata_config)
        self.status = SQLSourceStatus()

    def prepare(self):
        pass

    @classmethod
    def create(cls, config_dict: dict, metadata_config_dict: dict, ctx: WorkflowContext):
        pass

    def next_record(self) -> Iterable[OMetaDatabaseAndTable]:
        sql_config = self.config
        url = sql_config.get_sql_alchemy_url()
        logger.debug(f"sql_alchemy_url={url}")
        engine = create_engine(url, **sql_config.options)
        inspector = inspect(engine)
        for schema in inspector.get_schema_names():
            if not sql_config.schema_pattern.included(schema):
                self.status.report_dropped(schema, "Schema pattern not allowed")
                continue
            logger.debug("total tables {}".format(inspector.get_table_names(schema)))
            for table in inspector.get_table_names(schema):
                try:
                    schema, table = sql_config.standardize_schema_table_names(schema, table)
                    pk_constraints = inspector.get_pk_constraint(table, schema)
                    pk_columns = pk_constraints['column_constraints'] if len(
                        pk_constraints) > 0 and "column_constraints" in pk_constraints.keys() else {}
                    unique_constraints = []
                    try:
                        unique_constraints = inspector.get_unique_constraints(table, schema)
                    except NotImplementedError:
                        pass
                    unique_columns = []
                    for constraint in unique_constraints:
                        if 'column_names' in constraint.keys():
                            unique_columns = constraint['column_names']

                    dataset_name = sql_config.get_identifier(schema, table)
                    self.status.report_table_scanned('{}.{}'.format(self.config.service_name, dataset_name))
                    if not sql_config.table_pattern.included(dataset_name):
                        self.status.report_dropped('{}.{}'.format(self.config.service_name, dataset_name),
                                                   "Table pattern not allowed")
                        continue

                    columns = inspector.get_columns(table, schema)
                    table_info = {}
                    try:
                        table_info: dict = inspector.get_table_comment(table, schema)
                    except NotImplementedError:
                        description: Optional[str] = None
                        properties: Dict[str, str] = {}
                    else:
                        description = table_info["text"]

                    # The "properties" field is a non-standard addition to SQLAlchemy's interface.
                    properties = table_info.get("properties", {})
                    # TODO: capture inspector.get_pk_constraint
                    # TODO: capture inspector.get_sorted_table_and_fkc_names

                    table_columns = []
                    row_order = 1
                    for column in columns:
                        col_type = get_column_type(self.status, dataset_name, column['type'])
                        col_constraint = None
                        if column['nullable']:
                            col_constraint = ColumnConstraint.NULL
                        elif not column['nullable']:
                            col_constraint = ColumnConstraint.NOT_NULL

                        if column['name'] in pk_columns:
                            col_constraint = ColumnConstraint.PRIMARY_KEY
                        elif column['name'] in unique_columns:
                            col_constraint = ColumnConstraint.UNIQUE

                        table_columns.append(Column(name=column['name'],
                                                    description=column.get("comment", None),
                                                    columnDataType=col_type,
                                                    columnConstraint=col_constraint,
                                                    ordinalPosition=row_order))
                        row_order = row_order + 1

                    db = DatabaseEntity(id=uuid.uuid4(),
                                        name=schema,
                                        description=description if description is not None else ' ',
                                        service=EntityReference(id=self.service.id, type=self.config.service_type))
                    table = TableEntity(name=table,
                                        columns=table_columns)

                    table_and_db = OMetaDatabaseAndTable(table=table, database=db)
                    self.status.records_produced(table.name)
                    yield table_and_db
                except ValidationError as err:
                    logger.error(err)
                    self.status.report_dropped('{}.{}'.format(self.config.service_name, dataset_name),
                                               "Validation error")
                    continue

    def close(self):
        pass

    def get_status(self) -> SourceStatus:
        return self.status
