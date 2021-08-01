# generated by datamodel-codegen:
#   filename:  schema/type/dailyCount.json
#   timestamp: 2021-07-31T17:12:10+00:00

from __future__ import annotations

from pydantic import BaseModel, Field, conint

from . import basic


class DailyCountOfSomeMeasurement(BaseModel):
    count: conint(ge=0) = Field(
        ..., description='Daily count of a measurement on the given date'
    )
    date: basic.Date
