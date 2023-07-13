/*
 *  Copyright 2022 Collate.
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

import { AxiosError } from 'axios';
import { GlossaryTermForm } from 'components/AddGlossaryTermForm/AddGlossaryTermForm.interface';
import { getGlossaryTermDetailsPath } from 'constants/constants';
import { GLOSSARY_TERM_LIMIT } from 'constants/GlossaryTerms.constants';
import { compare } from 'fast-json-patch';
import { cloneDeep, isEmpty } from 'lodash';
import { VERSION_VIEW_GLOSSARY_PERMISSION } from 'mocks/Glossary.mock';
import { PagingResponse } from 'Models';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import {
  addGlossaryTerm,
  getGlossaryTerms,
  ListGlossaryTermsParams,
  patchGlossaryTerm,
} from 'rest/glossaryAPI';
import { Glossary } from '../../generated/entity/data/glossary';
import { GlossaryTerm } from '../../generated/entity/data/glossaryTerm';
import { getEntityDeleteMessage } from '../../utils/CommonUtils';
import { DEFAULT_ENTITY_PERMISSION } from '../../utils/PermissionsUtils';
import { getGlossaryPath } from '../../utils/RouterUtils';
import { showErrorToast, showSuccessToast } from '../../utils/ToastUtils';
import '../common/entityPageInfo/ManageButton/ManageButton.less';
import GlossaryDetails from '../GlossaryDetails/GlossaryDetails.component';
import GlossaryTermsV1 from '../GlossaryTerms/GlossaryTermsV1.component';
import EntityDeleteModal from '../Modals/EntityDeleteModal/EntityDeleteModal';
import { usePermissionProvider } from '../PermissionProvider/PermissionProvider';
import {
  OperationPermission,
  ResourceEntity,
} from '../PermissionProvider/PermissionProvider.interface';
import ExportGlossaryModal from './ExportGlossaryModal/ExportGlossaryModal';
import GlossaryTermModal from './GlossaryTermModal/GlossaryTermModal.component';
import { GlossaryAction, GlossaryV1Props } from './GlossaryV1.interfaces';
import './GlossaryV1.style.less';
import ImportGlossary from './ImportGlossary/ImportGlossary';

const GlossaryV1 = ({
  isGlossaryActive,
  deleteStatus = 'initial',
  selectedData,
  onGlossaryTermUpdate,
  updateGlossary,
  onGlossaryDelete,
  onGlossaryTermDelete,
  isVersionsView,
  onAssetClick,
  isSummaryPanelOpen,
}: GlossaryV1Props) => {
  const { t } = useTranslation();
  const { action, tab } =
    useParams<{ action: GlossaryAction; glossaryName: string; tab: string }>();
  const history = useHistory();

  const { getEntityPermission } = usePermissionProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsLoading, setIsTermsLoading] = useState(false);

  const [isDelete, setIsDelete] = useState<boolean>(false);

  const [glossaryPermission, setGlossaryPermission] =
    useState<OperationPermission>(DEFAULT_ENTITY_PERMISSION);

  const [glossaryTermPermission, setGlossaryTermPermission] =
    useState<OperationPermission>(DEFAULT_ENTITY_PERMISSION);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<
    GlossaryTerm | undefined
  >();
  const [editMode, setEditMode] = useState(false);

  const [glossaryTerms, setGlossaryTerms] = useState<PagingResponse<
    GlossaryTerm[]
  > | null>(null);
  const { id } = selectedData ?? {};

  const handleCancelGlossaryExport = () => {
    history.push(getGlossaryPath(selectedData.name));
  };

  const isImportAction = useMemo(
    () => action === GlossaryAction.IMPORT,
    [action]
  );
  const isExportAction = useMemo(
    () => action === GlossaryAction.EXPORT,
    [action]
  );

  const fetchGlossaryTerm = async (
    params?: ListGlossaryTermsParams,
    refresh?: boolean
  ) => {
    refresh ? setIsTermsLoading(true) : setIsLoading(true);
    try {
      const res = await getGlossaryTerms({
        ...params,
        limit: GLOSSARY_TERM_LIMIT,
        fields: 'tags,children,reviewers,relatedTerms,owner,parent',
      });

      setGlossaryTerms((prev) => {
        const data = refresh ? res.data : [...(prev?.data || []), ...res.data];

        return {
          ...prev,
          paging: res.paging,
          data,
        };
      });

      if (!refresh && params?.after) {
        showSuccessToast(
          `Loaded ${GLOSSARY_TERM_LIMIT} more glossary terms successfully.`
        );
      }
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      refresh ? setIsTermsLoading(false) : setIsLoading(false);
    }
  };

  const handleLoadMoreTerms = async () => {
    if (!glossaryTerms?.paging?.after) {
      return;
    }

    fetchGlossaryTerm({
      after: glossaryTerms.paging.after,
      [isGlossaryActive ? 'glossary' : 'parent']: id,
    });
  };

  const fetchGlossaryPermission = async () => {
    try {
      const response = await getEntityPermission(
        ResourceEntity.GLOSSARY,
        selectedData?.id as string
      );
      setGlossaryPermission(response);
    } catch (error) {
      showErrorToast(error as AxiosError);
    }
  };

  const fetchGlossaryTermPermission = async () => {
    try {
      const response = await getEntityPermission(
        ResourceEntity.GLOSSARY_TERM,
        selectedData?.id as string
      );
      setGlossaryTermPermission(response);
    } catch (error) {
      showErrorToast(error as AxiosError);
    }
  };

  const handleDelete = () => {
    const { id } = selectedData;
    if (isGlossaryActive) {
      onGlossaryDelete(id);
    } else {
      onGlossaryTermDelete(id);
    }
    setIsDelete(false);
  };

  const loadGlossaryTerms = useCallback(
    (refresh = false) => {
      fetchGlossaryTerm(
        isGlossaryActive ? { glossary: id } : { parent: id },
        refresh
      );
    },
    [id, isGlossaryActive]
  );

  const handleGlossaryTermModalAction = (
    editMode: boolean,
    glossaryTerm: GlossaryTerm | undefined
  ) => {
    setEditMode(editMode);
    setActiveGlossaryTerm(glossaryTerm);
    setIsEditModalOpen(true);
  };

  const updateGlossaryTerm = async (
    currentData: GlossaryTerm,
    updatedData: GlossaryTerm
  ) => {
    try {
      const jsonPatch = compare(currentData, updatedData);
      const response = await patchGlossaryTerm(currentData?.id, jsonPatch);
      if (!response) {
        throw t('server.entity-updating-error', {
          entity: t('label.glossary-term'),
        });
      }
      setGlossaryTerms((prev) => {
        if (!prev) {
          return prev;
        }

        const resultIndex = prev?.data.findIndex((i) => i.id === response.id);

        if (resultIndex >= 0) {
          if (currentData.name !== updatedData.name) {
            prev.data
              .filter((i) => i.parent?.id === updatedData.id)
              .forEach(
                (i) =>
                  (i.parent!.fullyQualifiedName = response.fullyQualifiedName)
              );
          }
          const newData = prev.data;
          newData[resultIndex] = { ...newData[resultIndex], ...response };

          return { ...prev, data: newData };
        } else {
          return prev;
        }
      });
      onTermModalSuccess();
    } catch (error) {
      showErrorToast(error as AxiosError);
    }
  };

  // const reloadCurrentGlossaryTerms = async () => {
  //   let res: PagingResponse<GlossaryTerm[]> | null = null;
  //   let res2: PagingResponse<GlossaryTerm[]> | null = null;

  //   try {
  //     if (glossaryTerms?.paging.before) {
  //       setIsLoading(true);

  //       res = await getGlossaryTerms({
  //         before: glossaryTerms?.paging.before,
  //         limit: GLOSSARY_TERM_LIMIT,
  //         fields: 'tags,children,reviewers,relatedTerms,owner,parent',
  //         [isGlossaryActive ? 'glossary' : 'parent']: id,
  //       });

  //       res2 = await getGlossaryTerms({
  //         after: res.paging.after,
  //         limit: GLOSSARY_TERM_LIMIT,
  //         fields: 'tags,children,reviewers,relatedTerms,owner,parent',
  //         [isGlossaryActive ? 'glossary' : 'parent']: id,
  //       });

  //       setGlossaryTerms((prev) => {
  //         const data = prev!.data.slice(
  //           0,
  //           prev!.data.length - GLOSSARY_TERM_LIMIT * 2
  //         );
  //         data.push(...(res?.data || []));
  //         data.push(...(res2?.data || []));

  //         return {
  //           paging: res2?.paging,
  //           data,
  //         };
  //       });
  //     } else {
  //       await fetchGlossaryTerm(
  //         isGlossaryActive ? { glossary: id } : { parent: id },
  //         true
  //       );
  //     }
  //   } catch (error) {
  //     showErrorToast(error as AxiosError);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const onTermModalSuccess = useCallback(() => {
    // reloadCurrentGlossaryTerms();
    if (!isGlossaryActive && tab !== 'terms') {
      history.push(
        getGlossaryTermDetailsPath(
          selectedData.fullyQualifiedName || '',
          'terms'
        )
      );
    }
    setIsEditModalOpen(false);
  }, [isGlossaryActive, tab, selectedData, glossaryTerms]);

  const handleGlossaryTermAdd = async (formData: GlossaryTermForm) => {
    try {
      const response = await addGlossaryTerm({
        ...formData,
        reviewers: formData.reviewers.map(
          (item) => item.fullyQualifiedName || ''
        ),
        glossary: activeGlossaryTerm?.glossary?.name || selectedData.name,
        parent: activeGlossaryTerm?.fullyQualifiedName,
      });

      setGlossaryTerms((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          paging: { ...prev.paging, total: prev.paging.total + 1 },
          data: [...prev.data, response as any],
        };
      });
      onTermModalSuccess();
    } catch (err) {
      showErrorToast(err as AxiosError);
    }
  };

  const handleGlossaryTermSave = async (formData: GlossaryTermForm) => {
    const newTermData = cloneDeep(activeGlossaryTerm);
    if (editMode) {
      if (newTermData && activeGlossaryTerm) {
        const {
          name,
          displayName,
          description,
          synonyms,
          tags,
          references,
          mutuallyExclusive,
          reviewers,
          owner,
          relatedTerms,
        } = formData || {};

        newTermData.name = name;
        newTermData.displayName = displayName;
        newTermData.description = description;
        newTermData.synonyms = synonyms;
        newTermData.tags = tags;
        newTermData.mutuallyExclusive = mutuallyExclusive;
        newTermData.reviewers = reviewers;
        newTermData.owner = owner;
        newTermData.references = references;
        newTermData.relatedTerms = relatedTerms?.map((term) => ({
          id: term,
          type: 'glossaryTerm',
        }));
        await updateGlossaryTerm(activeGlossaryTerm, newTermData);
      }
    } else {
      handleGlossaryTermAdd(formData);
    }
  };

  useEffect(() => {
    if (id && !action) {
      loadGlossaryTerms(true);
      if (isGlossaryActive) {
        isVersionsView
          ? setGlossaryPermission(VERSION_VIEW_GLOSSARY_PERMISSION)
          : fetchGlossaryPermission();
      } else {
        isVersionsView
          ? setGlossaryTermPermission(VERSION_VIEW_GLOSSARY_PERMISSION)
          : fetchGlossaryTermPermission();
      }
    }
  }, [id, isGlossaryActive, isVersionsView, action]);

  return isImportAction ? (
    <ImportGlossary glossaryName={selectedData.name} />
  ) : (
    <>
      {!isEmpty(selectedData) &&
        (isGlossaryActive ? (
          <GlossaryDetails
            glossary={selectedData as Glossary}
            glossaryTerms={glossaryTerms}
            handleGlossaryDelete={onGlossaryDelete}
            handleLoadMoreTerms={handleLoadMoreTerms}
            permissions={glossaryPermission}
            refreshGlossaryTerms={() => loadGlossaryTerms(true)}
            termsLoading={isTermsLoading || isLoading}
            updateGlossary={updateGlossary}
            onAddGlossaryTerm={(term) =>
              handleGlossaryTermModalAction(false, term)
            }
            onEditGlossaryTerm={(term) =>
              handleGlossaryTermModalAction(true, term)
            }
          />
        ) : (
          <GlossaryTermsV1
            childGlossaryTerms={glossaryTerms}
            glossaryTerm={selectedData as GlossaryTerm}
            handleGlossaryTermDelete={onGlossaryTermDelete}
            handleGlossaryTermUpdate={onGlossaryTermUpdate}
            handleLoadMoreTerms={handleLoadMoreTerms}
            isSummaryPanelOpen={isSummaryPanelOpen}
            permissions={glossaryTermPermission}
            refreshGlossaryTerms={() => loadGlossaryTerms(true)}
            termsLoading={isTermsLoading || isLoading}
            onAddGlossaryTerm={(term) =>
              handleGlossaryTermModalAction(false, term)
            }
            onAssetClick={onAssetClick}
            onEditGlossaryTerm={(term) =>
              handleGlossaryTermModalAction(true, term)
            }
          />
        ))}

      {selectedData && (
        <EntityDeleteModal
          bodyText={getEntityDeleteMessage(selectedData.name, '')}
          entityName={selectedData.name}
          entityType="Glossary"
          loadingState={deleteStatus}
          visible={isDelete}
          onCancel={() => setIsDelete(false)}
          onConfirm={handleDelete}
        />
      )}
      {isExportAction && (
        <ExportGlossaryModal
          glossaryName={selectedData.name}
          isModalOpen={isExportAction}
          onCancel={handleCancelGlossaryExport}
          onOk={handleCancelGlossaryExport}
        />
      )}

      {isEditModalOpen && (
        <GlossaryTermModal
          editMode={editMode}
          glossaryName={selectedData.name}
          glossaryReviewers={isGlossaryActive ? selectedData.reviewers : []}
          glossaryTerm={activeGlossaryTerm}
          visible={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleGlossaryTermSave}
        />
      )}
    </>
  );
};

export default GlossaryV1;
