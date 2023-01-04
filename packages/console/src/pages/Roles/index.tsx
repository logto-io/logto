import type { Role } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import ItemPreview from '@/components/ItemPreview';
import Table from '@/components/Table';
import type { RequestError } from '@/hooks/use-api';
import * as pageStyles from '@/scss/resources.module.scss';

const rolesPathname = '/roles';
const createRolePathname = `${rolesPathname}/create`;
const buildDetailsPathname = (id: string) => `${rolesPathname}/${id}`;

const Roles = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { data: roles, error, mutate } = useSWR<Role[], RequestError>(`/api/roles`);
  const isLoading = !roles && !error;

  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.headline}>
        <CardTitle title="roles.title" subtitle="roles.subtitle" />
        <Button
          icon={<Plus />}
          title="roles.create"
          type="primary"
          size="large"
          onClick={() => {
            navigate(createRolePathname);
          }}
        />
      </div>
      <Table
        className={pageStyles.table}
        rowGroups={[{ key: 'roles', data: roles }]}
        rowIndexKey="id"
        isLoading={isLoading}
        errorMessage={error?.body?.message ?? error?.message}
        columns={[
          {
            title: t('roles.role_name'),
            dataIndex: 'name',
            colSpan: 6,
            render: ({ id, name }) => <ItemPreview title={name} to={buildDetailsPathname(id)} />,
          },
          {
            title: t('roles.role_description'),
            dataIndex: 'description',
            colSpan: 10,
            render: ({ description }) => description,
          },
        ]}
        rowClickHandler={({ id }) => {
          navigate(buildDetailsPathname(id));
        }}
        placeholder={{
          content: (
            <Button
              title="roles.create"
              type="outline"
              onClick={() => {
                navigate(createRolePathname);
              }}
            />
          ),
        }}
        onRetry={async () => mutate(undefined, true)}
      />
    </div>
  );
};

export default Roles;
