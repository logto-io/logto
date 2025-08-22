import { RoleType, roleTypeToKey, type RoleResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg?react';
import RolesEmptyDark from '@/assets/images/roles-empty-dark.svg?react';
import RolesEmpty from '@/assets/images/roles-empty.svg?react';
import Breakable from '@/components/Breakable';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import PageMeta from '@/components/PageMeta';
import RoleIcon from '@/components/RoleIcon';
import { defaultPageSize, rbac } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import type { RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import pageLayout from '@/scss/page-layout.module.scss';
import { isPaidPlan } from '@/utils/subscription';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import AssignedEntities from './components/AssignedEntities';
import CreateRoleModal from './components/CreateRoleModal';

const rolesPathname = '/roles';
const createRolePathname = `${rolesPathname}/create`;
const buildDetailsPathname = (id: string) => `${rolesPathname}/${id}`;

const pageSize = defaultPageSize;

function Roles() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { search } = useLocation();
  const { navigate, match } = useTenantPathname();
  const isCreating = match(createRolePathname);
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionBasicQuota: { userRolesLimit, machineToMachineRolesLimit },
  } = useContext(SubscriptionDataContext);

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);
  // We need to hide the add-on tag for legacy plans who has unlimited roles.
  const hasRolesIncluded = userRolesLimit === null && machineToMachineRolesLimit === null;

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
    <div className={pageLayout.container}>
      <PageMeta titleKey="roles.page_title" />
      <div className={pageLayout.headline}>
        <CardTitle
          title="roles.title"
          subtitle="roles.subtitle"
          learnMoreLink={{ href: rbac }}
          // TODO: remove the dev feature when the new paywall logic is ready;
          hasAddOnTag={isDevFeaturesEnabled && isPaidTenant && !hasRolesIncluded}
        />
        <Button
          icon={<Plus />}
          type="primary"
          size="large"
          title="roles.create"
          onClick={() => {
            navigate({ pathname: createRolePathname, search });
          }}
        />
      </div>
      <Table
        className={pageLayout.table}
        rowGroups={[{ key: 'roles', data: roles }]}
        rowIndexKey="id"
        isLoading={isLoading}
        errorMessage={error?.body?.message ?? error?.message}
        columns={[
          {
            title: t('roles.col_roles'),
            dataIndex: 'roles',
            colSpan: 5,
            render: ({ id, name }) => (
              <ItemPreview title={name} to={buildDetailsPathname(id)} icon={<RoleIcon />} />
            ),
          },
          {
            title: t('roles.col_type'),
            dataIndex: 'type',
            colSpan: 4,
            render: ({ type }) => <Breakable>{t(`roles.type_${roleTypeToKey[type]}`)}</Breakable>,
          },
          {
            title: t('roles.col_description'),
            dataIndex: 'description',
            colSpan: 6,
            render: ({ description }) => <Breakable>{description}</Breakable>,
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
        ]}
        rowClickHandler={({ id }) => {
          navigate(buildDetailsPathname(id));
        }}
        filter={
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
          keyword ? (
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
          )
        }
        onRetry={async () => mutate(undefined, true)}
      />
      {isCreating && (
        <CreateRoleModal
          onClose={() => {
            navigate({ pathname: rolesPathname, search });
          }}
        />
      )}
    </div>
  );
}

export default Roles;
