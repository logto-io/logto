import type { User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import UsersEmptyDark from '@/assets/images/users-empty-dark.svg';
import UsersEmpty from '@/assets/images/users-empty.svg';
import ApplicationName from '@/components/ApplicationName';
import DateTime from '@/components/DateTime';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import ListPage from '@/components/ListPage';
import UserAvatar from '@/components/UserAvatar';
import { defaultPageSize } from '@/consts';
import { UserDetailsTabs } from '@/consts/page-tabs';
import Button from '@/ds-components/Button';
import Search from '@/ds-components/Search';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import type { RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { buildUrl, formatSearchKeyword } from '@/utils/url';
import { getUserTitle, getUserSubtitle } from '@/utils/user';

import CreateForm from './components/CreateForm';
import SuspendedTag from './components/SuspendedTag';

const pageSize = defaultPageSize;
const usersPathname = '/users';
const createUserPathname = `${usersPathname}/create`;
const buildDetailsPathname = (id: string) => `${usersPathname}/${id}/${UserDetailsTabs.Settings}`;

function Users() {
  const { search } = useLocation();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [{ page, keyword }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
    keyword: '',
  });

  const url = buildUrl('api/users', {
    page: String(page),
    page_size: String(pageSize),
    ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
  });

  const { data, error, mutate } = useSWR<[User[], number], RequestError>(url);
  const isLoading = !data && !error;
  const { navigate, match } = useTenantPathname();
  const [users, totalCount] = data ?? [];
  const isCreating = match(createUserPathname);

  return (
    <ListPage
      title={{
        title: 'users.title',
        subtitle: 'users.subtitle',
      }}
      pageMeta={{ titleKey: 'users.page_title' }}
      createButton={{
        title: 'users.create',
        onClick: () => {
          navigate({
            pathname: createUserPathname,
            search,
          });
        },
      }}
      table={{
        rowGroups: [{ key: 'users', data: users }],
        rowIndexKey: 'id',
        isLoading,
        errorMessage: error?.body?.message ?? error?.message,
        columns: [
          {
            title: t('users.user_name'),
            dataIndex: 'name',
            colSpan: 6,
            render: (user) => {
              const { id, isSuspended } = user;

              return (
                <ItemPreview
                  title={getUserTitle(user)}
                  subtitle={getUserSubtitle(user)}
                  icon={<UserAvatar size="large" user={user} />}
                  to={buildDetailsPathname(id)}
                  suffix={conditional(isSuspended && <SuspendedTag />)}
                />
              );
            },
          },
          {
            title: t('users.application_name'),
            dataIndex: 'app',
            colSpan: 5,
            render: ({ applicationId }) =>
              applicationId ? <ApplicationName applicationId={applicationId} /> : <div>-</div>,
          },
          {
            title: t('users.latest_sign_in'),
            dataIndex: 'lastSignInAt',
            colSpan: 5,
            render: ({ lastSignInAt }) => <DateTime>{lastSignInAt}</DateTime>,
          },
        ],
        filter: (
          <Search
            placeholder={t('users.search')}
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
        placeholder: keyword ? (
          <EmptyDataPlaceholder />
        ) : (
          <TablePlaceholder
            image={<UsersEmpty />}
            imageDark={<UsersEmptyDark />}
            title="users.placeholder_title"
            description="users.placeholder_description"
            action={
              <Button
                title="users.create"
                type="primary"
                size="large"
                icon={<Plus />}
                onClick={() => {
                  navigate({
                    pathname: createUserPathname,
                    search,
                  });
                }}
              />
            }
          />
        ),
        rowClickHandler: ({ id }) => {
          navigate(buildDetailsPathname(id));
        },
        pagination: {
          page,
          pageSize,
          totalCount,
          onChange: (page) => {
            updateSearchParameters({ page });
          },
        },
        onRetry: async () => mutate(undefined, true),
      }}
      widgets={
        isCreating && (
          <CreateForm
            onClose={() => {
              navigate({
                pathname: usersPathname,
                search,
              });
            }}
            onCreate={() => {
              void mutate();
            }}
          />
        )
      }
    />
  );
}

export default Users;
