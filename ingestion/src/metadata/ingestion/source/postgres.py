# This import verifies that the dependencies are available.
from abc import ABC
import uuid
from metadata.generated.schema.api.services.createDatabaseService import CreateDatabaseServiceEntityRequest
from metadata.generated.schema.entity.data.database import DatabaseEntity
from metadata.generated.schema.entity.services.databaseService import DatabaseServiceEntity, DatabaseServiceType
from metadata.generated.schema.type.common import EntityReference
from metadata.ingestion.api.common import AllowDenyPattern
from metadata.ingestion.models.ometa_table_db import OMetaDatabaseAndTable

import pymysql  # noqa: F401

from metadata.generated.schema.entity.data.table import TableEntity, Column
from metadata.ingestion.source.sql_source_common import SQLAlchemyHelper, SQLSourceStatus
from .sql_source import BasicSQLAlchemyConfig
from metadata.ingestion.api.source import Source, SourceStatus
from metadata.ingestion.models.table_metadata import DatabaseMetadata, ColumnMetadata, TableMetadata
from itertools import groupby
from typing import Iterator, Tuple, Union, Dict, Any, Iterable
from collections import namedtuple

from ..ometa.auth_provider import MetadataServerConfig
from ...utils.helpers import get_service_or_create

TableKey = namedtuple('TableKey', ['schema', 'table_name'])


class PostgresSourceConfig(BasicSQLAlchemyConfig):
    # defaults
    scheme = "postgresql+psycopg2"
    service_name = "postgres"
    service_type = "POSTGRES"

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


def get_table_key(row: Dict[str, Any]) -> Union[TableKey, None]:
    """
    Table key consists of schema and table name
    :param row:
    :return:
    """
    if row:
        return TableKey(schema=row['schema'], table_name=row['name'])

    return None


class PostgresSource(Source):
    # SELECT statement from mysql information_schema to extract table and column metadata
    SQL_STATEMENT = """
            SELECT
          c.table_catalog as cluster, c.table_schema as schema, c.table_name as name, pgtd.description as description
          ,c.column_name as col_name, c.data_type as col_type
          , pgcd.description as col_description, ordinal_position as col_sort_order
        FROM INFORMATION_SCHEMA.COLUMNS c
        INNER JOIN
          pg_catalog.pg_statio_all_tables as st on c.table_schema=st.schemaname and c.table_name=st.relname
        LEFT JOIN
          pg_catalog.pg_description pgcd on pgcd.objoid=st.relid and pgcd.objsubid=c.ordinal_position
        LEFT JOIN
          pg_catalog.pg_description pgtd on pgtd.objoid=st.relid and pgtd.objsubid=0
        ORDER by cluster, schema, name, col_sort_order
        """

    # CONFIG KEYS
    WHERE_CLAUSE_SUFFIX_KEY = 'where_clause_suffix'
    CLUSTER_KEY = 'cluster_key'
    USE_CATALOG_AS_CLUSTER_NAME = 'use_catalog_as_cluster_name'
    DATABASE_KEY = 'database_key'
    SERVICE_TYPE = 'POSTGRES'

    def __init__(self, config, metadata_config, ctx):
        super().__init__(ctx)
        self.sql_stmt = PostgresSource.SQL_STATEMENT
        self.alchemy_helper = SQLAlchemyHelper(config, metadata_config, ctx, "Postgres", self.sql_stmt)
        self._extract_iter: Union[None, Iterator] = None
        self._database = 'postgres'
        self.metadata_config = metadata_config
        self.status = SQLSourceStatus()
        self.service = get_service_or_create(config, metadata_config)
        self.table_pattern = AllowDenyPattern
        self.pattern = config.table_pattern

    @classmethod
    def create(cls, config_dict, metadata_config_dict, ctx):
        config = PostgresSourceConfig.parse_obj(config_dict)
        metadata_config = MetadataServerConfig.parse_obj(metadata_config_dict)
        return cls(config, metadata_config, ctx)

    def prepare(self):
        pass

    def _get_raw_extract_iter(self) -> Iterable[Dict[str, Any]]:
        """
        Provides iterator of result row from SQLAlchemy helper
        :return:
        """
        rows = self.alchemy_helper.execute_query()
        for row in rows:
            yield row

    def next_record(self) -> Iterable[DatabaseMetadata]:
        """
                Using itertools.groupby and raw level iterator, it groups to table and yields TableMetadata
                :return:
                """
        counter = 0
        # self.table_pattern: AllowDenyPattern = AllowDenyPattern.allowed(config.table_pattern, '')
        for key, group in groupby(self._get_raw_extract_iter(), get_table_key):
            columns = []
            for row in group:
                last_row = row
                col_type = ''
                if row['col_type'].upper() == 'CHARACTER VARYING':
                    col_type = 'VARCHAR'
                elif row['col_type'].upper() == 'CHARACTER':
                    col_type = 'CHAR'
                elif row['col_type'].upper() == 'INTEGER':
                    col_type = 'INT'
                elif row['col_type'].upper() == 'TIMESTAMP WITHOUT TIME ZONE':
                    col_type = 'TIMESTAMP'
                elif row['col_type'].upper() == 'DOUBLE PRECISION':
                    col_type = 'DOUBLE'
                elif row['col_type'].upper() == 'OID':
                    col_type = 'NUMBER'
                elif row['col_type'].upper() == 'NAME':
                    col_type = 'CHAR'
                else:
                    col_type = row['col_type'].upper()
                if not self.table_pattern.allowed(self.pattern, last_row[1]):
                    self.status.report_dropped(last_row['name'])
                    continue
                columns.append(Column(name=row['col_name'], description=row['col_description'],
                                      columnDataType=col_type, ordinalPosition=int(row['col_sort_order'])))

            table_metadata = TableEntity(name=last_row['name'],
                                         description=last_row['description'],
                                         columns=columns)

            self.status.report_table_scanned(table_metadata.name)

            dm = DatabaseEntity(id=uuid.uuid4(),
                                name=row['schema'],
                                description=row['description'] if row['description'] is not None else ' ',
                                service=EntityReference(id=self.service.id, type=self.SERVICE_TYPE))
            table_and_db = OMetaDatabaseAndTable(table=table_metadata, database=dm)
            self.status.records_produced(dm)
            yield table_and_db

    def close(self):
        self.alchemy_helper.close()

    def get_status(self) -> SourceStatus:
        return self.status
