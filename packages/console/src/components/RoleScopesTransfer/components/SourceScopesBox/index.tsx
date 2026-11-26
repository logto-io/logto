import type { ResourceResponse, ScopeResponse } from '@logto/schemas';
import { PredefinedScope, RoleType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Search from '@/assets/icons/search.svg?react';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import type { DetailedResourceResponse } from '@/components/RoleScopesTransfer/types';
import { defaultPageSize } from '@/consts';
import Pagination from '@/ds-components/Pagination';
import TextInput from '@/ds-components/TextInput';
import type { RequestError } from '@/hooks/use-api';
import useDebounce from '@/hooks/use-debounce';
import transferLayout from '@/scss/transfer.module.scss';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import ResourceItem from '../ResourceItem';

import styles from './index.module.scss';

type Props = {
  readonly roleId?: string;
  readonly roleType: RoleType;
  readonly selectedScopes: ScopeResponse[];
  readonly onChange: (value: ScopeResponse[]) => void;
};

const pageSize = defaultPageSize;

function SourceScopesBox({ roleId, roleType, selectedScopes, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const debounce = useDebounce();

  useEffect(() => {
    setPage(1);
  }, [roleType]);

  const url = buildUrl('api/resources', {
    page: String(page),
    page_size: String(pageSize),
    includeScopes: String(true),
    hasScopes: String(true),
    // Management API scopes are only assignable to machine-to-machine roles
    ...conditional(
      roleType !== RoleType.MachineToMachine && { excludeManagementApis: String(true) }
    ),
    ...conditional(roleId && { excludeRoleId: roleId }),
    ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
  });

  const { data, error } = useSWR<[ResourceResponse[], number], RequestError>(url, {
    keepPreviousData: false,
  });

  const isLoading = !data && !error;
  const hasError = Boolean(error);
  const [allResources, totalCount] = data ?? [];

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      setPage(1);
      setKeyword(event.target.value);
    });
  };

  const isScopeAdded = (scope: ScopeResponse) =>
    selectedScopes.findIndex(({ id }) => id === scope.id) >= 0;

  const onSelectScope = (scope: ScopeResponse) => {
    onChange(
      isScopeAdded(scope)
        ? selectedScopes.filter(({ id }) => id !== scope.id)
        : [scope, ...selectedScopes]
    );
  };

  const onSelectResource = ({ scopes: resourceScopes }: DetailedResourceResponse) => {
    const isAllSelected = resourceScopes.every((scope) => isScopeAdded(scope));
    const resourceScopesIds = new Set(resourceScopes.map(({ id }) => id));
    const selectedScopesExcludeResourceScopes = selectedScopes.filter(
      ({ id }) => !resourceScopesIds.has(id)
    );
    onChange(
      isAllSelected
        ? selectedScopesExcludeResourceScopes
        : [...resourceScopes, ...selectedScopesExcludeResourceScopes]
    );
  };

  const getResourceSelectedScopes = ({ scopes }: DetailedResourceResponse) =>
    scopes.filter((scope) => selectedScopes.findIndex(({ id }) => id === scope.id) >= 0);

  const dataSource: DetailedResourceResponse[] = useMemo(() => {
    if (!allResources) {
      return [];
    }

    const lowerCasedKeyword = keyword.toLowerCase();

    return allResources
      .map(({ scopes, ...resource }) => {
        const assignableScopes = scopes
          .filter(({ id }) => id !== PredefinedScope.All)
          .map((scope) => ({
            ...scope,
            resource,
          }));

        const doesResourceMatchKeyword =
          !lowerCasedKeyword ||
          resource.name.toLowerCase().includes(lowerCasedKeyword) ||
          resource.indicator.toLowerCase().includes(lowerCasedKeyword);

        return {
          ...resource,
          scopes: doesResourceMatchKeyword
            ? assignableScopes
            : assignableScopes.filter(({ name }) => name.toLowerCase().includes(lowerCasedKeyword)),
        };
      })
      .filter(({ scopes }) => scopes.length > 0);
  }, [allResources, keyword]);

  const isEmpty = !isLoading && !hasError && dataSource.length === 0;

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <TextInput
          className={styles.search}
          icon={<Search className={styles.icon} />}
          placeholder={t('general.search_placeholder')}
          onChange={handleSearchInput}
        />
      </div>
      <div
        className={classNames(transferLayout.boxContent, isEmpty && transferLayout.emptyBoxContent)}
      >
        {isEmpty ? (
          <EmptyDataPlaceholder size="small" title={t('role_details.permission.empty')} />
        ) : (
          dataSource.map((resource) => (
            <ResourceItem
              key={resource.id}
              resource={resource}
              selectedScopes={getResourceSelectedScopes(resource)}
              onSelectResource={onSelectResource}
              onSelectScope={onSelectScope}
            />
          ))
        )}
      </div>
      <Pagination
        mode="pico"
        page={page}
        totalCount={totalCount}
        pageSize={pageSize}
        className={transferLayout.boxPagination}
        onChange={(page) => {
          setPage(page);
        }}
      />
    </div>
  );
}

export default SourceScopesBox;
