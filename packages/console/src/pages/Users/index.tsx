import type { User } from '@logto/schemas';
import { conditional, conditionalString } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import ApplicationName from '@/components/ApplicationName';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import DateTime from '@/components/DateTime';
import ItemPreview from '@/components/ItemPreview';
import Pagination from '@/components/Pagination';
import Search from '@/components/Search';
import StickyHeaderTable from '@/components/Table/StickyHeaderTable';
import TableEmpty from '@/components/Table/TableEmpty';
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import UserAvatar from '@/components/UserAvatar';
import type { RequestError } from '@/hooks/use-api';
import * as resourcesStyles from '@/scss/resources.module.scss';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const pageSize = 20;

const userTableColumn = 3;

const usersPathname = '/users';
const createUserPathname = `${usersPathname}/create`;
const buildDetailsPathname = (id: string) => `${usersPathname}/${id}`;

const Users = () => {
  const { pathname } = useLocation();
  const isCreateNew = pathname === createUserPathname;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [query, setQuery] = useSearchParams();
  const search = query.toString();
  const pageIndex = Number(query.get('page') ?? '1');
  const keyword = query.get('search') ?? '';
  const { data, error, mutate } = useSWR<[User[], number], RequestError>(
    `/api/users?page=${pageIndex}&page_size=${pageSize}&hideAdminUser=true${conditionalString(
      keyword && `&search=%${keyword}%`
    )}`
  );
  const isLoading = !data && !error;
  const navigate = useNavigate();
  const [users, totalCount] = data ?? [];

  return (
    <div className={resourcesStyles.container}>
      <div className={resourcesStyles.headline}>
        <CardTitle title="users.title" subtitle="users.subtitle" />
        <Button
          title="users.create"
          size="large"
          type="primary"
          icon={<Plus />}
          onClick={() => {
            navigate({
              pathname: createUserPathname,
              search,
            });
          }}
        />
        {isCreateNew && (
          <CreateForm
            onClose={() => {
              navigate({
                pathname: usersPathname,
                search,
              });
            }}
          />
        )}
      </div>
      <StickyHeaderTable
        className={resourcesStyles.table}
        filter={
          <Search
            defaultValue={keyword}
            isClearable={Boolean(keyword)}
            onSearch={(value) => {
              setQuery(value ? { search: value } : {});
            }}
            onClearSearch={() => {
              setQuery({});
            }}
          />
        }
        header={
          <thead>
            <tr>
              <th>{t('users.user_name')}</th>
              <th>{t('users.application_name')}</th>
              <th>{t('users.latest_sign_in')}</th>
            </tr>
          </thead>
        }
        colGroup={
          <colgroup>
            <col className={styles.userName} />
            <col />
            <col />
          </colgroup>
        }
      >
        <tbody>
          {!data && error && (
            <TableError
              columns={userTableColumn}
              content={error.body?.message ?? error.message}
              onRetry={async () => mutate(undefined, true)}
            />
          )}
          {isLoading && <TableLoading columns={userTableColumn} />}
          {users?.length === 0 && (
            <TableEmpty columns={userTableColumn}>
              <Button
                title="users.create"
                type="outline"
                onClick={() => {
                  navigate({
                    pathname: createUserPathname,
                    search,
                  });
                }}
              />
            </TableEmpty>
          )}
          {users?.map(({ id, name, avatar, lastSignInAt, applicationId }) => (
            <tr
              key={id}
              className={styles.clickable}
              onClick={() => {
                navigate(buildDetailsPathname(id));
              }}
            >
              <td>
                <ItemPreview
                  title={name ?? t('users.unnamed')}
                  subtitle={id}
                  icon={<UserAvatar className={styles.avatar} url={avatar} />}
                  to={buildDetailsPathname(id)}
                  size="compact"
                />
              </td>
              <td>{applicationId ? <ApplicationName applicationId={applicationId} /> : '-'}</td>
              <td>
                <DateTime>{lastSignInAt}</DateTime>
              </td>
            </tr>
          ))}
        </tbody>
      </StickyHeaderTable>
      <Pagination
        pageIndex={pageIndex}
        totalCount={totalCount}
        pageSize={pageSize}
        className={styles.pagination}
        onChange={(page) => {
          setQuery({ page: String(page), ...conditional(keyword && { search: keyword }) });
        }}
      />
    </div>
  );
};

export default Users;
