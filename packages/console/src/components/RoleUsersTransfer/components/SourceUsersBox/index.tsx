import type { User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Search from '@/assets/images/search.svg';
import DataEmpty from '@/components/DataEmpty';
import Pagination from '@/components/Pagination';
import TextInput from '@/components/TextInput';
import { defaultPageSize } from '@/consts';
import type { RequestError } from '@/hooks/use-api';
import useDebounce from '@/hooks/use-debounce';
import { formatKeyword } from '@/hooks/use-table-search-params';
import * as transferLayout from '@/scss/transfer.module.scss';
import { buildUrl } from '@/utilities/url';

import SourceUserItem from '../SourceUserItem';
import * as styles from './index.module.scss';

type Props = {
  roleId: string;
  onChange: (value: User[]) => void;
  selectedUsers: User[];
};

const searchDelay = 500;

const SourceUsersBox = ({ roleId, selectedUsers, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [pageIndex, setPageIndex] = useState(1);
  const [keyword, setKeyword] = useState('');
  const debounce = useDebounce();

  const url = buildUrl('/api/users', {
    excludeRoleId: roleId,
    hideAdminUser: String(true),
    page: String(pageIndex),
    page_size: String(defaultPageSize),
    ...conditional(keyword && { search: formatKeyword(keyword) }),
  });

  const { data, error } = useSWR<[User[], number], RequestError>(url);

  const isLoading = !data && !error;

  const [dataSource = [], totalCount] = data ?? [];

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      setPageIndex(1);
      setKeyword(event.target.value);
    }, searchDelay);
  };

  const isUserAdded = (user: User) => selectedUsers.findIndex(({ id }) => id === user.id) >= 0;

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
          <DataEmpty imageClassName={styles.emptyImage} title={t('role_details.users.empty')} />
        ) : (
          dataSource.map((user) => {
            const isSelected = isUserAdded(user);

            return (
              <SourceUserItem
                key={user.id}
                user={user}
                isSelected={isSelected}
                onSelect={() => {
                  onChange(
                    isSelected
                      ? selectedUsers.filter(({ id }) => user.id !== id)
                      : [user, ...selectedUsers]
                  );
                }}
              />
            );
          })
        )}
      </div>
      <Pagination
        mode="pico"
        pageIndex={pageIndex}
        totalCount={totalCount}
        pageSize={defaultPageSize}
        className={transferLayout.boxPagination}
        onChange={(page) => {
          setPageIndex(page);
        }}
      />
    </div>
  );
};
export default SourceUsersBox;
