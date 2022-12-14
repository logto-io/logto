import type { User } from '@logto/schemas';
import { conditional, conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import ApplicationName from '@/components/ApplicationName';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import DateTime from '@/components/DateTime';
import ItemPreview from '@/components/ItemPreview';
import Pagination from '@/components/Pagination';
import Search from '@/components/Search';
import TableEmpty from '@/components/Table/TableEmpty';
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import { generatedPasswordStorageKey } from '@/consts';
import { generateAvatarPlaceHolderById } from '@/consts/avatars';
import type { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import * as resourcesStyles from '@/scss/resources.module.scss';
import * as tableStyles from '@/scss/table.module.scss';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const pageSize = 20;

const userTableColumn = 3;

const Users = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [query, setQuery] = useSearchParams();
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
            setIsCreateFormOpen(true);
          }}
        />
        <Modal
          shouldCloseOnEsc
          isOpen={isCreateFormOpen}
          className={modalStyles.content}
          overlayClassName={modalStyles.overlay}
          onRequestClose={() => {
            setIsCreateFormOpen(false);
          }}
        >
          <CreateForm
            onClose={(createdUser, password) => {
              setIsCreateFormOpen(false);

              if (createdUser && password) {
                sessionStorage.setItem(generatedPasswordStorageKey, password);
                navigate(`/users/${createdUser.id}`);
              }
            }}
          />
        </Modal>
      </div>

      <div className={classNames(resourcesStyles.table, styles.tableLayout)}>
        <div className={styles.filter}>
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
        </div>
        <div className={classNames(tableStyles.scrollable, styles.tableContainer)}>
          <table className={conditional(!data && tableStyles.empty)}>
            <colgroup>
              <col className={styles.userName} />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>{t('users.user_name')}</th>
                <th>{t('users.application_name')}</th>
                <th>{t('users.latest_sign_in')}</th>
              </tr>
            </thead>
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
                      setIsCreateFormOpen(true);
                    }}
                  />
                </TableEmpty>
              )}
              {users?.map(({ id, name, avatar, lastSignInAt, applicationId }) => (
                <tr
                  key={id}
                  className={tableStyles.clickable}
                  onClick={() => {
                    navigate(`/users/${id}`);
                  }}
                >
                  <td>
                    <ItemPreview
                      title={name ?? t('users.unnamed')}
                      subtitle={id}
                      icon={
                        <img
                          alt="avatar"
                          className={styles.avatar}
                          src={avatar ?? generateAvatarPlaceHolderById(id)}
                        />
                      }
                      to={`/users/${id}`}
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
          </table>
        </div>
      </div>
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
