import type { Role } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/images/delete.svg';
import Plus from '@/assets/images/plus.svg';
import Button from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import IconButton from '@/components/IconButton';
import Search from '@/components/Search';
import Table from '@/components/Table';
import TextLink from '@/components/TextLink';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';

import type { UserDetailsOutletContext } from '../types';
import * as styles from './index.module.scss';

const UserRoles = () => {
  const {
    user: { id: userId },
  } = useOutletContext<UserDetailsOutletContext>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data: roles, error, mutate } = useSWR<Role[], RequestError>(`/api/users/${userId}/roles`);

  const isLoading = !roles && !error;

  const [roleToBeDeleted, setRoleToBeDeleted] = useState<Role>();
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const handleDelete = async () => {
    if (!roleToBeDeleted || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`/api/users/${userId}/roles/${roleToBeDeleted.id}`);
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
              <TextLink to={`/roles/${id}`} target="_blank">
                {name}
              </TextLink>
            ),
          },
          {
            title: t('user_details.roles.name_column'),
            dataIndex: 'description',
            colSpan: 9,
            render: ({ description }) => description,
          },
          {
            title: null,
            dataIndex: 'delete',
            colSpan: 1,
            render: (role) => (
              <IconButton
                onClick={() => {
                  setRoleToBeDeleted(role);
                }}
              >
                <Delete />
              </IconButton>
            ),
          },
        ]}
        filter={
          <div className={styles.filter}>
            <Search />
            <Button
              title="user_details.roles.assign_button"
              type="primary"
              size="large"
              icon={<Plus />}
              onClick={() => {
                // TODO @xiaoyijun assign roles to user
              }}
            />
          </div>
        }
        placeholder={{
          content: (
            <Button
              title="user_details.roles.assign_button"
              type="outline"
              onClick={() => {
                // TODO @xiaoyijun assign roles to user
              }}
            />
          ),
        }}
        errorMessage={error?.body?.message ?? error?.message}
        onRetry={async () => mutate(undefined, true)}
      />
      {roleToBeDeleted && (
        <ConfirmModal
          isOpen
          isLoading={isDeleting}
          confirmButtonText="general.delete"
          onCancel={() => {
            setRoleToBeDeleted(undefined);
          }}
          onConfirm={handleDelete}
        >
          {t('user_details.roles.delete_description')}
        </ConfirmModal>
      )}
    </>
  );
};

export default UserRoles;
