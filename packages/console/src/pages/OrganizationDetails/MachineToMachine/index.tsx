import { type ApplicationWithOrganizationRoles } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import ActionsButton from '@/components/ActionsButton';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ApplicationPreview from '@/components/ItemPreview/ApplicationPreview';
import { RoleOption } from '@/components/OrganizationRolesSelect';
import { defaultPageSize } from '@/consts';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import useActionTranslation from '@/hooks/use-action-translation';
import useApi, { type RequestError } from '@/hooks/use-api';
import { buildUrl } from '@/utils/url';

import EditOrganizationRolesModal from '../EditOrganizationRolesModal';
import { type OrganizationDetailsOutletContext } from '../types';

import AddAppsToOrganization from './AddAppsToOrganization';
import * as styles from './index.module.scss';

const pageSize = defaultPageSize;

function MachineToMachine() {
  const { data: organization } = useOutletContext<OrganizationDetailsOutletContext>();
  const api = useApi();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const {
    data: response,
    error,
    mutate,
  } = useSWR<[ApplicationWithOrganizationRoles[], number], RequestError>(
    buildUrl(`api/organizations/${organization.id}/applications`, {
      q: keyword,
      page: String(page),
      page_size: String(pageSize),
    })
  );
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appToBeEdited, setAppToBeEdited] = useState<ApplicationWithOrganizationRoles>();
  const isLoading = !response && !error;
  const [data, totalCount] = response ?? [];

  return (
    <>
      <Table
        isRowHoverEffectDisabled
        placeholder={<EmptyDataPlaceholder />}
        pagination={{
          page,
          totalCount,
          pageSize,
          onChange: setPage,
        }}
        isLoading={isLoading}
        errorMessage={error?.toString()}
        rowGroups={[{ key: 'data', data }]}
        columns={[
          {
            dataIndex: 'application',
            title: t('applications.application_name'),
            colSpan: 4,
            render: (data) => <ApplicationPreview data={data} />,
          },
          {
            dataIndex: 'roles',
            title: t('organization_details.roles'),
            colSpan: 6,
            render: ({ organizationRoles }) => {
              if (organizationRoles.length === 0) {
                return '-';
              }

              return (
                <div className={styles.roles}>
                  {organizationRoles.map(({ id, name }) => (
                    <Tag key={id} variant="cell">
                      <RoleOption value={id} title={name} />
                    </Tag>
                  ))}
                </div>
              );
            },
          },
          {
            dataIndex: 'actions',
            title: null,
            colSpan: 1,
            render: (data) => (
              <ActionsButton
                deleteConfirmation="organization_details.remove_application_from_organization_description"
                fieldName="organization_details.application"
                textOverrides={{
                  edit: 'organization_details.edit_organization_roles',
                  delete: 'organization_details.remove_application_from_organization',
                  deleteConfirmation: 'general.remove',
                }}
                onEdit={() => {
                  setAppToBeEdited(data);
                }}
                onDelete={async () => {
                  await api.delete(`api/organizations/${organization.id}/applications/${data.id}`);
                  void mutate();
                }}
              />
            ),
          },
        ]}
        rowIndexKey="id"
        filter={
          <div className={styles.filter}>
            <Search
              defaultValue={keyword}
              isClearable={Boolean(keyword)}
              placeholder={t('organization_details.search_application_placeholder')}
              onSearch={(value) => {
                setKeyword(value);
                setPage(1);
              }}
              onClearSearch={() => {
                setKeyword('');
                setPage(1);
              }}
            />
            <Button
              size="large"
              title={
                <DangerousRaw>{tAction('add', 'organizations.machine_to_machine')}</DangerousRaw>
              }
              type="primary"
              icon={<Plus />}
              onClick={() => {
                setIsModalOpen(true);
              }}
            />
          </div>
        }
      />
      {appToBeEdited && (
        <EditOrganizationRolesModal
          isOpen
          type="application"
          organizationId={organization.id}
          data={appToBeEdited}
          onClose={() => {
            setAppToBeEdited(undefined);
            void mutate();
          }}
        />
      )}
      <AddAppsToOrganization
        organization={organization}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          void mutate();
        }}
      />
    </>
  );
}

export default MachineToMachine;
