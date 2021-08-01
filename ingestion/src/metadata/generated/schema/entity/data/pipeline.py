# generated by datamodel-codegen:
#   filename:  schema/entity/data/pipeline.json
#   timestamp: 2021-07-31T17:12:10+00:00

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, constr

from ...type import basic, entityReference


class PipelineEntity(BaseModel):
    id: basic.Uuid = Field(
        ..., description='Unique identifier that identifies a pipeline instance'
    )
    name: constr(min_length=1, max_length=64) = Field(
        ..., description='Name that identifies the this pipeline instance uniquely.'
    )
    fullyQualifiedName: Optional[constr(min_length=1, max_length=64)] = Field(
        None,
        description="Unique name that identifies a pipeline in the format 'ServiceName.PipelineName'",
    )
    description: Optional[str] = Field(
        None, description='Description of this pipeline.'
    )
    href: Optional[basic.Href] = Field(
        None, description='Link to the resource corresponding to this entity'
    )
    owner: Optional[entityReference.EntityReference] = Field(
        None, description='Owner of this pipeline'
    )
    service: entityReference.EntityReference = Field(
        ..., description='Link to service where this pipeline is hosted in'
    )
