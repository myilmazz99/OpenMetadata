# generated by datamodel-codegen:
#   filename:  schema/type/schedule.json
#   timestamp: 2021-07-31T17:12:10+00:00

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from . import basic


class TypeUsedForScheduleWithStartTimeAndRepeatFrequency(BaseModel):
    startDate: Optional[basic.DateTime] = Field(
        None, description='Start date and time of the schedule'
    )
    repeatFrequency: Optional[basic.Duration] = Field(
        None, description='Repeat frequency in ISO 8601 duration format'
    )
