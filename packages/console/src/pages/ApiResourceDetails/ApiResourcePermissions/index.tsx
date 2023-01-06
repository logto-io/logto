import type { Scope } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/images/delete.svg';
import Plus from '@/assets/images/plus.svg';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import Search from '@/components/Search';
import Table from '@/components/Table';
import type { RequestError } from '@/hooks/use-api';

import type { ApiResourceDetailsOutletContext } from '../types';
import CreatePermissionModal from './components/CreatePermissionModal';
import * as styles from './index.module.scss';

const ApiResourcePermissions = () => {
  const {
    resource: { id: resourceId },
  } = useOutletContext<ApiResourceDetailsOutletContext>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    data: scopes,
    error,
    mutate,
  } = useSWR<Scope[], RequestError>(`/api/resources/${resourceId}/scopes`);

  const isLoading = !scopes && !error;

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  return (
    <>
      <Table
        className={styles.permissionTable}
        rowIndexKey="id"
        rowGroups={[{ key: 'scopes', data: scopes }]}
        columns={[
          {
            title: t('api_resource_details.permission.name_column'),
            dataIndex: 'name',
            colSpan: 6,
            render: ({ name }) => <div className={styles.name}>{name}</div>,
          },
          {
            title: t('api_resource_details.permission.description_column'),
            dataIndex: 'description',
            colSpan: 9,
            render: ({ description }) => <div className={styles.description}>{description}</div>,
          },
          {
            title: null,
            dataIndex: 'delete',
            colSpan: 1,
            render: () => (
              <IconButton>
                <Delete />
              </IconButton>
            ),
          },
        ]}
        filter={
          <div className={styles.filter}>
            <Search />
            <Button
              title="api_resource_details.permission.create_button"
              type="primary"
              size="large"
              icon={<Plus />}
              onClick={() => {
                setIsCreateFormOpen(true);
              }}
            />
          </div>
        }
        isLoading={isLoading}
        placeholder={{
          content: (
            <Button
              title="api_resource_details.permission.create_button"
              type="outline"
              onClick={() => {
                setIsCreateFormOpen(true);
              }}
            />
          ),
        }}
        errorMessage={error?.body?.message ?? error?.message}
        onRetry={async () => mutate(undefined, true)}
      />
      {isCreateFormOpen && (
        <CreatePermissionModal
          resourceId={resourceId}
          onClose={(scope) => {
            if (scope) {
              toast.success(
                t('api_resource_details.permission.permission_created', { name: scope.name })
              );
              void mutate();
            }
            setIsCreateFormOpen(false);
          }}
        />
      )}
    </>
  );
};

export default ApiResourcePermissions;
