import type { User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Search from '@/assets/images/search.svg';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import Pagination from '@/components/Pagination';
import TextInput from '@/components/TextInput';
import { defaultPageSize } from '@/consts';
import type { RequestError } from '@/hooks/use-api';
import useDebounce from '@/hooks/use-debounce';
import * as transferLayout from '@/scss/transfer.module.scss';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import SourceUserItem from '../SourceUserItem';
import * as styles from './index.module.scss';

type Props = {
  roleId: string;
  onChange: (value: User[]) => void;
  selectedUsers: User[];
};

const pageSize = defaultPageSize;

const SourceUsersBox = ({ roleId, selectedUsers, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const debounce = useDebounce();

  const url = buildUrl('api/users', {
    excludeRoleId: roleId,
    page: String(page),
    page_size: String(pageSize),
    ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
  });

  const { data, error } = useSWR<[User[], number], RequestError>(url);

  const isLoading = !data && !error;

  const [dataSource = [], totalCount] = data ?? [];

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      setPage(1);
      setKeyword(event.target.value);
    });
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
          <EmptyDataPlaceholder size="small" title={t('role_details.users.empty')} />
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
};
export default SourceUsersBox;
