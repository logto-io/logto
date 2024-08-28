import type { Role } from '@logto/schemas';
import { RoleType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg';
import Plus from '@/assets/icons/plus.svg';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import RoleAssignmentModal from '@/components/RoleAssignmentModal';
import RoleIcon from '@/components/RoleIcon';
import { defaultPageSize } from '@/consts';
import Button from '@/ds-components/Button';
import ConfirmModal from '@/ds-components/ConfirmModal';
import IconButton from '@/ds-components/IconButton';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import { Tooltip } from '@/ds-components/Tip';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTheme from '@/hooks/use-theme';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import type { UserDetailsOutletContext } from '../types';

import * as styles from './index.module.scss';

const pageSize = defaultPageSize;

function UserRoles() {
  const theme = useTheme();
  const { user } = useOutletContext<UserDetailsOutletContext>();
  const { id: userId } = user;

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [{ page, keyword }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
    keyword: '',
  });

  const { data, error, mutate } = useSWR<[Role[], number], RequestError>(
    buildUrl(`api/users/${userId}/roles`, {
      page: String(page),
      page_size: String(pageSize),
      ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
    })
  );

  const isLoading = !data && !error;

  const [roles, totalCount] = data ?? [];

  const [isAssignRolesModalOpen, setIsAssignRolesModalOpen] = useState(false);
  const [roleToBeDeleted, setRoleToBeDeleted] = useState<Role>();
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const handleDelete = async () => {
    if (!roleToBeDeleted || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`api/users/${userId}/roles/${roleToBeDeleted.id}`);
      toast.success(t('user_details.roles.deleted', { name: roleToBeDeleted.name }));
      await mutate();
      setRoleToBeDeleted(undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Table
        className={styles.rolesTable}
        isLoading={isLoading}
        rowGroups={[{ key: 'roles', data: roles }]}
        rowIndexKey="id"
        columns={[
          {
            title: t('user_details.roles.name_column'),
            dataIndex: 'name',
            colSpan: 6,
            render: ({ id, name }) => (
              <ItemPreview title={name} to={`/roles/${id}`} icon={<RoleIcon />} />
            ),
          },
          {
            title: t('user_details.roles.description_column'),
            dataIndex: 'description',
            colSpan: 9,
            render: ({ description }) => <div className={styles.description}>{description}</div>,
          },
          {
            title: null,
            dataIndex: 'delete',
            colSpan: 1,
            render: (role) => (
              <Tooltip content={t('general.remove')}>
                <IconButton
                  onClick={() => {
                    setRoleToBeDeleted(role);
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
              placeholder={t('user_details.roles.search')}
              onSearch={(keyword) => {
                updateSearchParameters({ keyword, page: 1 });
              }}
              onClearSearch={() => {
                updateSearchParameters({ keyword: '', page: 1 });
              }}
            />
            <Button
              title="user_details.roles.assign_button"
              type="primary"
              size="large"
              icon={<Plus />}
              onClick={() => {
                setIsAssignRolesModalOpen(true);
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
        placeholder={<EmptyDataPlaceholder />}
        errorMessage={error?.body?.message ?? error?.message}
        onRetry={async () => mutate(undefined, true)}
      />
      {roleToBeDeleted && (
        <ConfirmModal
          isOpen
          isLoading={isDeleting}
          confirmButtonText="general.remove"
          onCancel={() => {
            setRoleToBeDeleted(undefined);
          }}
          onConfirm={handleDelete}
        >
          {t('user_details.roles.delete_description')}
        </ConfirmModal>
      )}
      {isAssignRolesModalOpen && (
        <RoleAssignmentModal
          entity={user}
          type={RoleType.User}
          onClose={(success) => {
            if (success) {
              void mutate();
            }
            setIsAssignRolesModalOpen(false);
          }}
        />
      )}
    </>
  );
}

export default UserRoles;
