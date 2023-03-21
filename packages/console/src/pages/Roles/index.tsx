import type { RoleResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import RolesEmptyDark from '@/assets/images/roles-empty-dark.svg';
import RolesEmpty from '@/assets/images/roles-empty.svg';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import ItemPreview from '@/components/ItemPreview';
import Search from '@/components/Search';
import Table from '@/components/Table';
import TablePlaceholder from '@/components/Table/TablePlaceholder';
import { defaultPageSize } from '@/consts';
import type { RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import * as pageStyles from '@/scss/resources.module.scss';
import { withAppInsights } from '@/utils/app-insights';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import AssignedUsers from './components/AssignedUsers';
import CreateRoleModal from './components/CreateRoleModal';
import * as styles from './index.module.scss';

const rolesPathname = '/roles';
const createRolePathname = `${rolesPathname}/create`;
const buildDetailsPathname = (id: string) => `${rolesPathname}/${id}`;

const pageSize = defaultPageSize;

function Roles() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const isOnCreatePage = pathname === createRolePathname;
  const { getDocumentationUrl } = useDocumentationUrl();

  const [{ page, keyword }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
    keyword: '',
  });

  const url = buildUrl('api/roles', {
    page: String(page),
    page_size: String(pageSize),
    ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
  });

  const { data, error, mutate } = useSWR<[RoleResponse[], number], RequestError>(url);

  const isLoading = !data && !error;

  const [roles, totalCount] = data ?? [];

  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.headline}>
        <CardTitle
          title="roles.title"
          subtitle="roles.subtitle"
          learnMoreLink="https://docs.logto.io/docs/recipes/rbac/manage-permissions-and-roles#manage-roles"
        />
        <Button
          icon={<Plus />}
          title="roles.create"
          type="primary"
          size="large"
          onClick={() => {
            navigate({ pathname: createRolePathname, search });
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
            colSpan: 5,
            render: ({ id, name }) => <ItemPreview title={name} to={buildDetailsPathname(id)} />,
          },
          {
            title: t('roles.role_description'),
            dataIndex: 'description',
            colSpan: 6,
            render: ({ description }) => <div className={styles.description}>{description}</div>,
          },
          {
            title: <span>{t('roles.assigned_users')}</span>,
            dataIndex: 'users',
            colSpan: 5,
            render: ({ featuredUsers, usersCount }) => (
              <AssignedUsers users={featuredUsers} count={usersCount} />
            ),
          },
        ]}
        rowClickHandler={({ id }) => {
          navigate(buildDetailsPathname(id));
        }}
        filter={
          <Search
            inputClassName={styles.search}
            placeholder={t('roles.search')}
            defaultValue={keyword}
            isClearable={Boolean(keyword)}
            onSearch={(keyword) => {
              updateSearchParameters({ keyword, page: 1 });
            }}
            onClearSearch={() => {
              updateSearchParameters({ keyword: '', page: 1 });
            }}
          />
        }
        pagination={{
          page,
          totalCount,
          pageSize,
          onChange: (page) => {
            updateSearchParameters({ page });
          },
        }}
        placeholder={
          <TablePlaceholder
            image={<RolesEmpty />}
            imageDark={<RolesEmptyDark />}
            title="roles.placeholder_title"
            description="roles.placeholder_description"
            learnMoreLink={getDocumentationUrl(
              '/docs/recipes/rbac/manage-permissions-and-roles#manage-roles'
            )}
            action={
              <Button
                title="roles.create"
                type="primary"
                size="large"
                icon={<Plus />}
                onClick={() => {
                  navigate({ pathname: createRolePathname, search });
                }}
              />
            }
          />
        }
        onRetry={async () => mutate(undefined, true)}
      />
      {isOnCreatePage && (
        <CreateRoleModal
          onClose={() => {
            navigate({ pathname: rolesPathname, search });
          }}
        />
      )}
    </div>
  );
}

export default withAppInsights(Roles);
