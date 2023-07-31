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

import { Space, Typography } from 'antd';
import { AxiosError } from 'axios';
import { useGlobalSearchProvider } from 'components/GlobalSearchProvider/GlobalSearchProvider';
import { tabsInfo } from 'constants/explore.constants';
import {
  urlGitbookDocs,
  urlGithubRepo,
  urlJoinSlack,
  urlPlatformGuide,
} from 'constants/URL.constants';
import { isEmpty, isString, max } from 'lodash';
import { observer } from 'mobx-react';
import Qs from 'qs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getVersion } from 'rest/miscAPI';
import { extractDetailsFromToken } from 'utils/AuthProvider.util';
import { getEntityName } from 'utils/EntityUtils';
import appState from '../../AppState';
import { ReactComponent as IconAPI } from '../../assets/svg/api.svg';
import { ReactComponent as IconDoc } from '../../assets/svg/doc.svg';
import { ReactComponent as IconExternalLink } from '../../assets/svg/external-link.svg';
import { ReactComponent as IconSlackGrey } from '../../assets/svg/slack-grey.svg';
import { ReactComponent as IconVersionBlack } from '../../assets/svg/version-black.svg';
import {
  getExplorePath,
  getTeamAndUserDetailsPath,
  getUserPath,
  ROUTES,
  TERM_ADMIN,
  TERM_USER,
} from '../../constants/constants';
import {
  addToRecentSearched,
  getNonDeletedTeams,
} from '../../utils/CommonUtils';
import SVGIcons, { Icons } from '../../utils/SvgUtils';
import { showErrorToast } from '../../utils/ToastUtils';
import { useAuthContext } from '../authentication/auth-provider/AuthProvider';
import NavBar from '../nav-bar/NavBar';
import './app-bar.style.less';

const Appbar: React.FC = (): JSX.Element => {
  const location = useLocation();
  const history = useHistory();
  const { t } = useTranslation();

  const {
    isAuthDisabled,
    isAuthenticated,
    isProtectedRoute,
    isTourRoute,
    onLogoutHandler,
  } = useAuthContext();

  const { searchCriteria } = useGlobalSearchProvider();

  const parsedQueryString = Qs.parse(
    location.search.startsWith('?')
      ? location.search.substr(1)
      : location.search
  );

  const searchQuery = isString(parsedQueryString.search)
    ? parsedQueryString.search
    : '';

  const [searchValue, setSearchValue] = useState(searchQuery);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState<boolean>(false);
  const [version, setVersion] = useState<string>('');

  const handleFeatureModal = (value: boolean) => {
    setIsFeatureModalOpen(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    value ? setIsOpen(true) : setIsOpen(false);
  };

  const supportLink = [
    {
      label: (
        <Space
          className="cursor-pointer w-full"
          size={4}
          onClick={() => history.push(ROUTES.TOUR)}>
          <SVGIcons
            alt="tour-con"
            className="align-middle m-r-xss"
            icon={Icons.TOUR}
            width="16"
          />
          <span className="text-base-color">{t('label.tour')}</span>
        </Space>
      ),
      key: 'tour',
    },
    {
      label: (
        <a
          className="link-title"
          href={urlPlatformGuide}
          rel="noreferrer"
          target="_blank">
          <Space size={4}>
            <SVGIcons
              alt="tour-con"
              className="align-middle m-r-xss"
              icon={Icons.ICON_GUIDE}
              width="16"
            />
            <span className="text-base-color">{t('label.platform-guide')}</span>
            <IconExternalLink className="m-l-xss" height={14} width={14} />
          </Space>
        </a>
      ),
      key: 'platformGuide',
    },
    {
      label: (
        <a
          className="link-title"
          href={urlGitbookDocs}
          rel="noreferrer"
          target="_blank">
          <Space size={4}>
            <IconDoc
              className="tw-align-middle tw--mt-0.5 tw-mr-0.5"
              height={14}
              name="Doc icon"
              width={14}
            />
            <span className="text-base-color">{t('label.doc-plural')}</span>

            <IconExternalLink className="m-l-xss" height={14} width={14} />
          </Space>
        </a>
      ),
      key: 'docs',
    },
    {
      label: (
        <Link className="link-title" to={ROUTES.SWAGGER}>
          <Space size={4}>
            <IconAPI
              className="tw-align-middle tw--mt-0.5 tw-mr-0.5"
              height={14}
              name="API icon"
              width={14}
            />
            <span className="text-base-color">{t('label.api-uppercase')}</span>
          </Space>
        </Link>
      ),
      key: 'api',
    },
    {
      label: (
        <a
          className="link-title"
          href={urlJoinSlack}
          rel="noreferrer"
          target="_blank">
          <Space size={4}>
            <IconSlackGrey
              className="tw-align-middle tw--mt-0.5 tw-mr-0.5"
              height={14}
              name="slack icon"
              width={14}
            />
            <span className="text-base-color">{t('label.slack-support')}</span>
            <IconExternalLink className="m-l-xss" height={14} width={14} />
          </Space>
        </a>
      ),
      key: 'slack',
    },

    {
      label: (
        <Space
          className="cursor-pointer w-full"
          size={4}
          onClick={() => handleFeatureModal(true)}>
          <SVGIcons
            alt="Doc icon"
            className="align-middle m-r-xss"
            icon={Icons.WHATS_NEW}
            width="14"
          />
          <span className="text-base-color">{t('label.whats-new')}</span>
        </Space>
      ),
      key: 'whats-new',
    },
    {
      label: (
        <a
          className="link-title"
          href={urlGithubRepo}
          rel="noreferrer"
          target="_blank">
          <Space size={4}>
            <IconVersionBlack
              className="tw-align-middle tw--mt-0.5 tw-mr-0.5"
              height={14}
              name="Version icon"
              width={14}
            />

            <span className="text-base-color hover:text-primary">{`${t(
              'label.version'
            )} ${(version ? version : '?').split('-')[0]}`}</span>

            <IconExternalLink className="m-l-xss" height={14} width={14} />
          </Space>
        </a>
      ),
      key: 'versions',
    },
  ];

  const getUsersRoles = (userRoleArr: string[], name: string) => {
    return (
      <div>
        <div className="tw-text-grey-muted tw-text-xs">{name}</div>
        {userRoleArr.map((userRole, i) => (
          <Typography.Paragraph
            className="ant-typography-ellipsis-custom font-normal"
            ellipsis={{ tooltip: true }}
            key={i}>
            {userRole}
          </Typography.Paragraph>
        ))}
        <hr className="tw-my-1.5" />
      </div>
    );
  };

  const getUserName = () => {
    const currentUser = isAuthDisabled
      ? appState.nonSecureUserDetails
      : appState.userDetails;

    return currentUser?.displayName || currentUser?.name || TERM_USER;
  };

  const getUserData = () => {
    const currentUser = isAuthDisabled
      ? appState.nonSecureUserDetails
      : appState.userDetails;

    const name = currentUser?.displayName || currentUser?.name || TERM_USER;

    const roles = currentUser?.roles?.map((r) => getEntityName(r)) || [];
    const inheritedRoles =
      currentUser?.inheritedRoles?.map((r) => getEntityName(r)) || [];

    currentUser?.isAdmin && roles.unshift(TERM_ADMIN);

    const userTeams = getNonDeletedTeams(currentUser?.teams ?? []);

    const teams = userTeams.splice(0, 3);
    const remainingTeamsCount = max([userTeams.length, 0]);

    return (
      <div className="tw-max-w-xs" data-testid="greeting-text">
        <Link
          data-testid="user-name"
          to={getUserPath(currentUser?.name as string)}>
          {' '}
          <Typography.Paragraph
            className="ant-typography-ellipsis-custom font-medium cursor-pointer text-primary"
            ellipsis={{ rows: 1, tooltip: true }}>
            {name}
          </Typography.Paragraph>
        </Link>
        <hr className="tw-my-1.5" />
        {roles.length > 0 ? getUsersRoles(roles, t('label.role-plural')) : null}
        {inheritedRoles.length > 0
          ? getUsersRoles(inheritedRoles, t('label.inherited-role-plural'))
          : null}
        {teams.length > 0 ? (
          <div>
            <span className="tw-text-grey-muted tw-text-xs">
              {t('label.team-plural')}
            </span>
            {teams.map((t, i) => (
              <Typography.Paragraph
                className="ant-typography-ellipsis-custom text-sm"
                ellipsis={{ tooltip: true }}
                key={i}>
                <Link to={getTeamAndUserDetailsPath(t.name as string)}>
                  {t.displayName || t.name}
                </Link>
              </Typography.Paragraph>
            ))}
            {remainingTeamsCount ? (
              <Link
                className="more-teams-pill"
                to={getUserPath(currentUser?.name as string)}>
                {remainingTeamsCount} {t('label.more')}
              </Link>
            ) : null}
            <hr className="tw-mt-1.5" />
          </div>
        ) : null}
      </div>
    );
  };

  const profileDropdown = [
    {
      name: getUserData(),
      to: '',
      disabled: false,
      icon: <></>,
      isText: true,
    },
    {
      name: t('label.logout'),
      to: '',
      disabled: false,
      method: onLogoutHandler,
    },
  ];

  const searchHandler = (value: string) => {
    setIsOpen(false);
    addToRecentSearched(value);

    const defaultTab: string =
      searchCriteria !== '' ? tabsInfo[searchCriteria].path : '';

    history.push(
      getExplorePath({
        tab: defaultTab,
        search: value,
        isPersistFilters: false,
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (e.key === 'Enter') {
      searchHandler(target.value);
    }
  };

  const handleOnclick = () => {
    searchHandler(searchValue);
  };

  const handleClear = () => {
    setSearchValue('');
    searchHandler('');
  };

  const fetchOMVersion = () => {
    getVersion()
      .then((res) => {
        setVersion(res.version);
      })
      .catch((err: AxiosError) => {
        showErrorToast(
          err,
          t('server.entity-fetch-error', {
            entity: t('label.version'),
          })
        );
      });
  };

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isAuthDisabled) {
      fetchOMVersion();
    } else {
      if (!isEmpty(appState.userDetails)) {
        fetchOMVersion();
      }
    }
  }, [appState.userDetails, isAuthDisabled]);

  useEffect(() => {
    const handleDocumentVisibilityChange = () => {
      if (
        isProtectedRoute(location.pathname) &&
        isTourRoute(location.pathname)
      ) {
        return;
      }
      const { isExpired, exp } = extractDetailsFromToken();
      if (!document.hidden && isExpired) {
        exp && toast.info(t('message.session-expired'));
        onLogoutHandler();
      }
    };

    addEventListener('focus', handleDocumentVisibilityChange);

    return () => {
      removeEventListener('focus', handleDocumentVisibilityChange);
    };
  }, []);

  return (
    <>
      {isProtectedRoute(location.pathname) &&
      (isAuthDisabled || isAuthenticated) &&
      !isTourRoute(location.pathname) ? (
        <NavBar
          handleClear={handleClear}
          handleFeatureModal={handleFeatureModal}
          handleKeyDown={handleKeyDown}
          handleOnClick={handleOnclick}
          handleSearchBoxOpen={setIsOpen}
          handleSearchChange={handleSearchChange}
          isFeatureModalOpen={isFeatureModalOpen}
          isSearchBoxOpen={isOpen}
          pathname={location.pathname}
          profileDropdown={profileDropdown}
          searchValue={searchValue || ''}
          supportDropdown={supportLink}
          username={getUserName()}
        />
      ) : null}
    </>
  );
};

export default observer(Appbar);
