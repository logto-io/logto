import { User } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import DateTime from '@/components/DateTime';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import ItemPreview from '@/components/ItemPreview';
import Pagination from '@/components/Pagination';
import Search from '@/components/Search';
import TableEmpty from '@/components/Table/TableEmpty';
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import { RequestError } from '@/hooks/use-api';
import Plus from '@/icons/Plus';
import * as modalStyles from '@/scss/modal.module.scss';
import * as tableStyles from '@/scss/table.module.scss';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const pageSize = 20;

const Users = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [query, setQuery] = useSearchParams();
  const pageIndex = Number(query.get('page') ?? '1');
  const keyword = query.get('search') ?? '';
  const { data, error, mutate } = useSWR<[User[], number], RequestError>(
    `/api/users?page=${pageIndex}&page_size=${pageSize}${conditionalString(
      keyword && `&search=${keyword}`
    )}`
  );
  const isLoading = !data && !error;
  const navigate = useNavigate();
  const [users, totalCount] = data ?? [];

  return (
    <Card className={styles.card}>
      <div className={styles.headline}>
        <CardTitle title="users.title" subtitle="users.subtitle" />
        <Button
          title="admin_console.users.create"
          type="primary"
          icon={<Plus />}
          onClick={() => {
            setIsCreateFormOpen(true);
          }}
        />
        <Modal
          isOpen={isCreateFormOpen}
          className={modalStyles.content}
          overlayClassName={modalStyles.overlay}
        >
          <CreateForm
            onClose={(createdUser, password) => {
              setIsCreateFormOpen(false);

              if (createdUser && password) {
                navigate(`/users/${createdUser.id}?password=${password}`);
              }
            }}
          />
        </Modal>
      </div>
      <div className={styles.filter}>
        <Search
          defaultValue={keyword}
          onSearch={(value) => {
            setQuery({ search: value });
          }}
        />
      </div>
      <div className={classNames(styles.table, tableStyles.scrollable)}>
        <table>
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
            {error && (
              <TableError
                columns={3}
                content={error.body.message}
                onRetry={async () => mutate(undefined, true)}
              />
            )}
            {isLoading && <TableLoading columns={3} />}
            {users?.length === 0 && (
              <TableEmpty columns={3}>
                <Button
                  title="admin_console.users.create"
                  type="outline"
                  onClick={() => {
                    setIsCreateFormOpen(true);
                  }}
                />
              </TableEmpty>
            )}
            {users?.map(({ id, name, username, lastSignIn }) => (
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
                    subtitle={conditionalString(username)}
                    icon={<ImagePlaceholder size={24} />}
                    to={`/users/${id}`}
                    size="compact"
                  />
                </td>
                <td>Application</td>
                <td>
                  <DateTime>{lastSignIn}</DateTime>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        {!!totalCount && (
          <Pagination
            pageCount={Math.ceil(totalCount / pageSize)}
            pageIndex={pageIndex}
            onChange={(page) => {
              setQuery({ page: String(page) });
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default Users;
