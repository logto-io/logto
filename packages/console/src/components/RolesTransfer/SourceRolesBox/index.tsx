import type { RoleResponse } from '@logto/schemas';
import { RoleType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Search from '@/assets/icons/search.svg';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { defaultPageSize } from '@/consts';
import Pagination from '@/ds-components/Pagination';
import TextInput from '@/ds-components/TextInput';
import type { RequestError } from '@/hooks/use-api';
import useDebounce from '@/hooks/use-debounce';
import * as transferLayout from '@/scss/transfer.module.scss';
import { buildUrl } from '@/utils/url';

import SourceRoleItem from './SourceRoleItem';
import * as styles from './index.module.scss';

type Props = {
  readonly entityId: string;
  readonly type: RoleType;
  readonly selectedRoles: RoleResponse[];
  readonly onChange: (value: RoleResponse[]) => void;
};

const pageSize = defaultPageSize;

function SourceRolesBox({ entityId, type, selectedRoles, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const debounce = useDebounce();

  const url = buildUrl('api/roles', {
    page: String(page),
    page_size: String(pageSize),
    type,
    [type === RoleType.User ? 'excludeUserId' : 'excludeApplicationId']: entityId,
    ...conditional(keyword && { search: `%${keyword}%` }),
  });

  const { data, error } = useSWR<[RoleResponse[], number], RequestError>(url, {
    /**
     * Always use the latest data to reflect the latest available roles.
     * Using cached data before new data is loaded can result in roles that have been assigned or deleted being rendered in the list.
     * If a deleted role is rendered in the list, it will cause the query requests for role scopes in the list items to return a 404 error.
     */
    keepPreviousData: false,
  });

  const isLoading = !data && !error;

  const [dataSource = [], totalCount] = data ?? [];

  const isRoleSelected = (role: RoleResponse) =>
    selectedRoles.findIndex(({ id }) => role.id === id) >= 0;

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      setPage(1);
      setKeyword(event.target.value);
    });
  };

  const isEmpty = !isLoading && !error && dataSource.length === 0;

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
          <EmptyDataPlaceholder
            size="small"
            title={t(
              type === RoleType.User
                ? 'user_details.roles.empty'
                : 'application_details.roles.empty'
            )}
          />
        ) : (
          dataSource.map((role) => {
            const isSelected = isRoleSelected(role);

            return (
              <SourceRoleItem
                key={role.id}
                role={role}
                isSelected={isSelected}
                onSelect={() => {
                  onChange(
                    isSelected
                      ? selectedRoles.filter(({ id }) => id !== role.id)
                      : [role, ...selectedRoles]
                  );
                }}
              />
            );
          })
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

export default SourceRolesBox;
