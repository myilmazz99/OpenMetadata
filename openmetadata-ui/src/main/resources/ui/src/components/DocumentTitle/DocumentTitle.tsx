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
import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface DocumentTitleProps {
  title: string;
}

const DocumentTitle: FC<DocumentTitleProps> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <Helmet>
      <title>{`${title} | ${t('label.datahub')}`}</title>
    </Helmet>
  );
};

export default DocumentTitle;
