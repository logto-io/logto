import { type Application, ApplicationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import ApplicationIcon from '@/components/ApplicationIcon';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
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
import AssignRoleModal from '@/pages/Roles/components/AssignRoleModal';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import type { RoleDetailsOutletContext } from '../types';

import styles from './index.module.scss';

const pageSize = defaultPageSize;

function RoleApplications() {
  const { role } = useOutletContext<RoleDetailsOutletContext>();

  const { id: roleId } = role;

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [{ page, keyword }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
    keyword: '',
  });

  const { data, error, mutate } = useSWR<[Application[], number], RequestError>(
    roleId &&
      buildUrl(`api/roles/${roleId}/applications`, {
        page: String(page),
        page_size: String(pageSize),
        ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
      })
  );

  const isLoading = !data && !error;

  const [applications, totalCount] = data ?? [];

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [applicationToBeDeleted, setApplicationToBeDeleted] = useState<Application>();
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const handleDelete = async () => {
    if (!applicationToBeDeleted || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`api/roles/${roleId}/applications/${applicationToBeDeleted.id}`);
      toast.success(t('role_details.applications.deleted', { name: applicationToBeDeleted.name }));
      await mutate();
      setApplicationToBeDeleted(undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Table
        className={styles.applicationsTable}
        isLoading={isLoading}
        rowGroups={[{ key: 'applications', data: applications }]}
        rowIndexKey="id"
        columns={[
          {
            title: t('role_details.applications.app_column'),
            dataIndex: 'name',
            colSpan: 5,
            render: (application) => {
              return (
                <ItemPreview
                  title={application.name}
                  icon={
                    <ApplicationIcon
                      type={ApplicationType.MachineToMachine}
                      className={styles.icon}
                    />
                  }
                  to={`/applications/${application.id}`}
                />
              );
            },
          },
          {
            title: t('role_details.applications.description_column'),
            dataIndex: 'description',
            colSpan: 5,
            render: ({ description }) => <span>{conditional(description) ?? '-'}</span>,
          },
          {
            title: null,
            dataIndex: 'delete',
            colSpan: 1,
            render: (application) => (
              <Tooltip content={t('general.remove')}>
                <IconButton
                  onClick={() => {
                    setApplicationToBeDeleted(application);
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
              title="role_details.applications.assign_button"
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
        placeholder={<EmptyDataPlaceholder />}
      />
      {applicationToBeDeleted && (
        <ConfirmModal
          isOpen
          isLoading={isDeleting}
          confirmButtonText="general.remove"
          onCancel={() => {
            setApplicationToBeDeleted(undefined);
          }}
          onConfirm={handleDelete}
        >
          {t('role_details.applications.delete_description')}
        </ConfirmModal>
      )}
      {isAssignModalOpen && (
        <AssignRoleModal
          role={role}
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
}

export default RoleApplications;
