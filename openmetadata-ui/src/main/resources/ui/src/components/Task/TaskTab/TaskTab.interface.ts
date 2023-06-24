/*
 *  Copyright 2023 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import { EntityType } from 'enums/entity.enum';
import { Column } from 'generated/entity/data/table';
import { Thread } from 'generated/entity/feed/thread';
import { EntityReference } from 'generated/entity/type';
import { TagLabel } from 'generated/type/tagLabel';

export type TaskTabProps = {
  task: Thread;
  owner?: EntityReference;
  tags?: TagLabel[];
  onUpdateEntityDetails?: () => void;
  description?: string;
} & (
  | TableTaskTabProps
  | { columns?: undefined; entityType: Exclude<EntityType, EntityType.TABLE> }
);

export interface TableTaskTabProps {
  columns?: Column[];
  entityType: EntityType.TABLE;
}
