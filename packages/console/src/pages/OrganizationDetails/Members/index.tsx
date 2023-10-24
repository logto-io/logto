import { type UserWithOrganizationRoles, type Organization } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import ActionsButton from '@/components/ActionsButton';
import DateTime from '@/components/DateTime';
import UserPreview from '@/components/ItemPreview/UserPreview';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import useActionTranslation from '@/hooks/use-action-translation';
import useApi, { type RequestError } from '@/hooks/use-api';
import { buildUrl } from '@/utils/url';

import AddMembersToOrganization from './AddMembersToOrganization';
import EditOrganizationRolesModal from './EditOrganizationRolesModal';
import * as styles from './index.module.scss';

type Props = {
  organization: Organization;
};

function Members({ organization }: Props) {
  const api = useApi();
  const [keyword, setKeyword] = useState('');
  const { data, error, mutate } = useSWR<UserWithOrganizationRoles[], RequestError>(
    buildUrl(`api/organizations/${organization.id}/users`, { q: keyword })
  );
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToBeEdited, setUserToBeEdited] = useState<UserWithOrganizationRoles>();

  if (error) {
    return null; // TODO: error handling
  }

  if (!data) {
    return null; // TODO: loading
  }

  return (
    <>
      <Table
        rowGroups={[{ key: 'data', data }]}
        columns={[
          {
            dataIndex: 'user',
            title: 'User',
            colSpan: 4,
            render: (user) => <UserPreview user={user} />,
          },
          {
            dataIndex: 'roles',
            title: 'Organization roles',
            colSpan: 6,
            render: ({ organizationRoles }) => {
              if (organizationRoles.length === 0) {
                return '-';
              }

              return (
                <div className={styles.roles}>
                  {organizationRoles.map(({ id, name }) => (
                    <Tag key={id} variant="cell">
                      {name}
                    </Tag>
                  ))}
                </div>
              );
            },
          },
          {
            dataIndex: 'lastSignInAt',
            title: 'Last sign-in',
            colSpan: 5,
            render: ({ lastSignInAt }) => <DateTime>{lastSignInAt}</DateTime>,
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
              }}
              onClearSearch={() => {
                setKeyword('');
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
          organizationId={organization.id}
          user={userToBeEdited}
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
