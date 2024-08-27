import { type UserWithOrganizationRoles } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg?react';
import ActionsButton from '@/components/ActionsButton';
import { LocaleDate } from '@/components/DateTime';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import UserPreview from '@/components/ItemPreview/UserPreview';
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

import AddMembersToOrganization from './AddMembersToOrganization';
import styles from './index.module.scss';

const pageSize = defaultPageSize;

function Members() {
  const { data: organization } = useOutletContext<OrganizationDetailsOutletContext>();
  const api = useApi();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const {
    data: response,
    error,
    mutate,
  } = useSWR<[UserWithOrganizationRoles[], number], RequestError>(
    buildUrl(`api/organizations/${organization.id}/users`, {
      q: keyword,
      page: String(page),
      page_size: String(pageSize),
    })
  );
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToBeEdited, setUserToBeEdited] = useState<UserWithOrganizationRoles>();
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
            dataIndex: 'user',
            title: t('organization_details.user'),
            colSpan: 4,
            render: (user) => <UserPreview user={user} />,
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
            dataIndex: 'lastSignInAt',
            title: t('users.latest_sign_in'),
            colSpan: 5,
            render: ({ lastSignInAt }) => <LocaleDate>{lastSignInAt}</LocaleDate>,
          },
          {
            dataIndex: 'actions',
            title: null,
            colSpan: 1,
            render: (user) => (
              <ActionsButton
                deleteConfirmation="organization_details.remove_user_from_organization_description"
                fieldName="organization_details.user"
                textOverrides={{
                  edit: 'organization_details.edit_organization_roles',
                  delete: 'organization_details.remove_user_from_organization',
                  deleteConfirmation: 'general.remove',
                }}
                onEdit={() => {
                  setUserToBeEdited(user);
                }}
                onDelete={async () => {
                  await api.delete(`api/organizations/${organization.id}/users/${user.id}`);
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
              placeholder={t('organization_details.search_user_placeholder')}
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
              title={<DangerousRaw>{tAction('add', 'organization_details.member')}</DangerousRaw>}
              type="primary"
              icon={<Plus />}
              onClick={() => {
                setIsModalOpen(true);
              }}
            />
          </div>
        }
      />
      {userToBeEdited && (
        <EditOrganizationRolesModal
          isOpen
          type="user"
          organizationId={organization.id}
          data={userToBeEdited}
          onClose={() => {
            setUserToBeEdited(undefined);
            void mutate();
          }}
        />
      )}
      <AddMembersToOrganization
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

export default Members;
