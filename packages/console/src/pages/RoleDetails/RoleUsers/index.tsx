import type { User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/images/delete.svg';
import Plus from '@/assets/images/plus.svg';
import ApplicationName from '@/components/ApplicationName';
import Button from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DateTime from '@/components/DateTime';
import IconButton from '@/components/IconButton';
import ItemPreview from '@/components/ItemPreview';
import Search from '@/components/Search';
import Table from '@/components/Table';
import { Tooltip } from '@/components/Tip';
import UserAvatar from '@/components/UserAvatar';
import { defaultPageSize } from '@/consts';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useSearchParameters from '@/hooks/use-search-parameters';
import { buildUrl, formatSearchKeyword } from '@/utilities/url';

import type { RoleDetailsOutletContext } from '../types';
import AssignUsersModal from './components/AssignUsersModal';
import * as styles from './index.module.scss';

const pageSize = defaultPageSize;

const RoleUsers = () => {
  const {
    role: { id: roleId },
  } = useOutletContext<RoleDetailsOutletContext>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [{ page, keyword }, updateSearchParameters] = useSearchParameters({
    page: 1,
    keyword: '',
  });

  const { data, error, mutate } = useSWR<[User[], number], RequestError>(
    roleId &&
      buildUrl(`/api/roles/${roleId}/users`, {
        page: String(page),
        page_size: String(pageSize),
        ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
      })
  );

  const isLoading = !data && !error;

  const [users, totalCount] = data ?? [];

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [userToBeDeleted, setUserToBeDeleted] = useState<User>();
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const handleDelete = async () => {
    if (!userToBeDeleted || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`/api/roles/${roleId}/users/${userToBeDeleted.id}`);
      toast.success(t('role_details.users.deleted', { name: userToBeDeleted.name }));
      await mutate();
      setUserToBeDeleted(undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Table
        className={styles.usersTable}
        isLoading={isLoading}
        rowGroups={[{ key: 'users', data: users }]}
        rowIndexKey="id"
        columns={[
          {
            title: t('role_details.users.name_column'),
            dataIndex: 'name',
            colSpan: 5,
            render: ({ id, name, avatar }) => (
              <ItemPreview
                title={name ?? t('users.unnamed')}
                subtitle={id}
                icon={<UserAvatar className={styles.avatar} url={avatar} />}
                to={`/users/${id}`}
                size="compact"
              />
            ),
          },
          {
            title: t('role_details.users.app_column'),
            dataIndex: 'app',
            colSpan: 5,
            render: ({ applicationId }) =>
              applicationId ? <ApplicationName applicationId={applicationId} /> : '-',
          },
          {
            title: t('role_details.users.latest_sign_in_column'),
            dataIndex: 'latestSignIn',
            colSpan: 5,
            render: ({ lastSignInAt }) => <DateTime>{lastSignInAt}</DateTime>,
          },
          {
            title: null,
            dataIndex: 'delete',
            colSpan: 1,
            render: (user) => (
              <Tooltip content={t('general.remove')}>
                <IconButton
                  onClick={() => {
                    setUserToBeDeleted(user);
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            ),
          },
        ]}
        filter={
          <div className={styles.filter}>
            <Search
              defaultValue={keyword}
              isClearable={Boolean(keyword)}
              placeholder={t('general.search_placeholder')}
              onSearch={(keyword) => {
                updateSearchParameters({ keyword, page: 1 });
              }}
              onClearSearch={() => {
                updateSearchParameters({ keyword: '', page: 1 });
              }}
            />
            <Button
              title="role_details.users.assign_button"
              type="primary"
              size="large"
              icon={<Plus />}
              onClick={() => {
                setIsAssignModalOpen(true);
              }}
            />
          </div>
        }
        pagination={{
          page,
          pageSize,
          totalCount,
          onChange: (page) => {
            updateSearchParameters({ page });
          },
        }}
        placeholder={{
          content: (
            <Button
              title="role_details.users.assign_button"
              type="outline"
              onClick={() => {
                setIsAssignModalOpen(true);
              }}
            />
          ),
        }}
      />
      {userToBeDeleted && (
        <ConfirmModal
          isOpen
          isLoading={isDeleting}
          confirmButtonText="general.remove"
          onCancel={() => {
            setUserToBeDeleted(undefined);
          }}
          onConfirm={handleDelete}
        >
          {t('role_details.users.delete_description')}
        </ConfirmModal>
      )}
      {isAssignModalOpen && (
        <AssignUsersModal
          roleId={roleId}
          onClose={(success) => {
            if (success) {
              void mutate();
            }
            setIsAssignModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default RoleUsers;
