import type { User } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Search from '@/assets/images/search.svg';
import type { RequestError } from '@/hooks/use-api';
import { onKeyDownHandler } from '@/utilities/a11y';

import Checkbox from '../Checkbox';
import Pagination from '../Pagination';
import TextInput from '../TextInput';
import UserAvatar from '../UserAvatar';
import * as styles from './index.module.scss';

type Props = {
  onAddUser: (user: User) => void;
  onRemoveUser: (user: User) => void;
  selectedUsers: User[];
};

const pageSize = 20;

const UserSourceBox = ({ selectedUsers, onAddUser, onRemoveUser }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [pageIndex, setPageIndex] = useState(1);
  const [keyword, setKeyword] = useState('');

  const { data } = useSWR<[User[], number], RequestError>(
    `/api/users?page=${pageIndex}&page_size=${pageSize}&hideAdminUser=true${conditionalString(
      keyword && `&search=${encodeURIComponent(`%${keyword}%`)}`
    )}`
  );

  const [dataSource = [], totalCount] = data ?? [];

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    setPageIndex(1);
    setKeyword(event.target.value);
  };

  const isUserAdded = (user: User) => selectedUsers.findIndex(({ id }) => id === user.id) >= 0;

  const onSelectUser = (user: User) => {
    const userAdded = isUserAdded(user);

    if (userAdded) {
      onRemoveUser(user);

      return;
    }
    onAddUser(user);
  };

  return (
    <div className={styles.box}>
      <div className={styles.top}>
        <TextInput
          className={styles.search}
          icon={<Search className={styles.icon} />}
          placeholder={t('general.search_placeholder')}
          onChange={handleSearchInput}
        />
      </div>
      <div className={styles.content}>
        {dataSource.map((user) => {
          const added = isUserAdded(user);
          const { id, name, avatar } = user;

          return (
            <div
              key={id}
              role="button"
              tabIndex={0}
              className={styles.item}
              onKeyDown={onKeyDownHandler(() => {
                onSelectUser(user);
              })}
              onClick={() => {
                onSelectUser(user);
              }}
            >
              <Checkbox
                checked={added}
                disabled={false}
                onChange={() => {
                  onSelectUser(user);
                }}
              />
              <UserAvatar className={styles.avatar} url={avatar} />
              <div className={styles.name}>{name ?? t('users.unnamed')}</div>
            </div>
          );
        })}
      </div>
      <Pagination
        mode="pico"
        pageIndex={pageIndex}
        totalCount={totalCount}
        pageSize={pageSize}
        className={styles.pagination}
        onChange={(page) => {
          setPageIndex(page);
        }}
      />
    </div>
  );
};
export default UserSourceBox;
