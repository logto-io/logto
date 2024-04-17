import { RoleType, type RoleResponse } from '@logto/schemas';
import { Theme } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import MachineToMachineRoleIconDark from '@/assets/icons/m2m-role-dark.svg';
import MachineToMachineRoleIcon from '@/assets/icons/m2m-role.svg';
import Plus from '@/assets/icons/plus.svg';
import UserRoleIconDark from '@/assets/icons/user-role-dark.svg';
import UserRoleIcon from '@/assets/icons/user-role.svg';
import RolesEmptyDark from '@/assets/images/roles-empty-dark.svg';
import RolesEmpty from '@/assets/images/roles-empty.svg';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import ListPage from '@/components/ListPage';
import { defaultPageSize } from '@/consts';
import Button from '@/ds-components/Button';
import Search from '@/ds-components/Search';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import type { RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import AssignedEntities from './components/AssignedEntities';
import CreateRoleModal from './components/CreateRoleModal';
import * as styles from './index.module.scss';

const rolesPathname = '/roles';
const createRolePathname = `${rolesPathname}/create`;
const buildDetailsPathname = (id: string) => `${rolesPathname}/${id}`;

const pageSize = defaultPageSize;

const getRoleIcon = (type: RoleType, isDarkMode: boolean) => {
  if (type === RoleType.User) {
    return isDarkMode ? <UserRoleIconDark /> : <UserRoleIcon />;
  }

  return isDarkMode ? <MachineToMachineRoleIconDark /> : <MachineToMachineRoleIcon />;
};

function Roles() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { search } = useLocation();
  const { navigate, match } = useTenantPathname();
  const isCreating = match(createRolePathname);
  const { getDocumentationUrl } = useDocumentationUrl();
  const theme = useTheme();

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
    <ListPage
      title={{
        title: 'roles.title',
        subtitle: 'roles.subtitle',
        learnMoreLink: {
          href: 'https://docs.logto.io/docs/recipes/rbac/manage-permissions-and-roles#manage-roles',
          targetBlank: 'noopener',
        },
      }}
      pageMeta={{ titleKey: 'roles.page_title' }}
      createButton={{
        title: 'roles.create',
        onClick: () => {
          navigate({ pathname: createRolePathname, search });
        },
      }}
      table={{
        rowGroups: [{ key: 'roles', data: roles }],
        rowIndexKey: 'id',
        isLoading,
        errorMessage: error?.body?.message ?? error?.message,
        columns: [
          {
            title: t('roles.col_roles'),
            dataIndex: 'roles',
            colSpan: 5,
            render: ({ id, name, type }) => (
              <ItemPreview
                title={name}
                to={buildDetailsPathname(id)}
                icon={getRoleIcon(type, theme === Theme.Dark)}
              />
            ),
          },
          {
            title: t('roles.col_type'),
            dataIndex: 'type',
            colSpan: 5,
            render: ({ type }) => (
              <div className={styles.type}>
                {type === RoleType.User ? t('roles.type_user') : t('roles.type_machine_to_machine')}
              </div>
            ),
          },
          {
            title: t('roles.col_description'),
            dataIndex: 'description',
            colSpan: 5,
            render: ({ description }) => <div className={styles.description}>{description}</div>,
          },
          {
            title: <span>{t('roles.col_assigned_entities')}</span>,
            dataIndex: 'entities',
            colSpan: 5,
            render: ({
              type,
              featuredUsers,
              usersCount,
              featuredApplications,
              applicationsCount,
            }) => {
              if (type === RoleType.User) {
                return <AssignedEntities entities={featuredUsers} count={usersCount} type={type} />;
              }
              return (
                <AssignedEntities
                  entities={featuredApplications}
                  count={applicationsCount}
                  type={type}
                />
              );
            },
          },
        ],
        rowClickHandler: ({ id }) => {
          navigate(buildDetailsPathname(id));
        },
        filter: (
          <Search
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
        ),
        pagination: {
          page,
          totalCount,
          pageSize,
          onChange: (page) => {
            updateSearchParameters({ page });
          },
        },
        placeholder: keyword ? (
          <EmptyDataPlaceholder />
        ) : (
          <TablePlaceholder
            image={<RolesEmpty />}
            imageDark={<RolesEmptyDark />}
            title="roles.placeholder_title"
            description="roles.placeholder_description"
            learnMoreLink={{
              href: getDocumentationUrl(
                '/docs/recipes/rbac/manage-permissions-and-roles#manage-roles'
              ),
              targetBlank: 'noopener',
            }}
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
        ),
        onRetry: async () => mutate(undefined, true),
      }}
      widgets={
        isCreating && (
          <CreateRoleModal
            onClose={() => {
              navigate({ pathname: rolesPathname, search });
            }}
          />
        )
      }
    />
  );
}

export default Roles;
