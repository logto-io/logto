import { User } from '@logto/schemas';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import BackLink from '@/components/BackLink';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import { RequestError } from '@/hooks/use-api';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import Reset from '@/icons/Reset';
import * as modalStyles from '@/scss/modal.module.scss';

import ChangePasswordForm from './components/ChangePasswordForm';
import CreateSuccess from './components/CreateSuccess';
import DeleteForm from './components/DeleteForm';
import * as styles from './index.module.scss';

const UserDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isChangePasswordFormOpen, setIsChangePasswordFormOpen] = useState(false);

  const { data, error } = useSWR<User, RequestError>(id && `/api/users/${id}`);
  const isLoading = !data && !error;

  return (
    <div className={styles.container}>
      <BackLink to="/users">{t('user_details.back_to_users')}</BackLink>

      {isLoading && <div>loading</div>}
      {error && <div>{`error occurred: ${error.metadata.code}`}</div>}
      {data && (
        <>
          <Card className={styles.header}>
            <ImagePlaceholder size={76} borderRadius={16} />
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name ?? '-'}</div>
              <div>
                <div className={styles.username}>{data.username}</div>
                <div className={styles.verticalBar} />
                <div className={styles.text}>User ID</div>
                <CopyToClipboard value={data.id} className={styles.copy} />
              </div>
            </div>
            <div>
              <ActionMenu buttonProps={{ icon: <More /> }} title={t('user_details.more_options')}>
                <ActionMenuItem
                  icon={<Reset />}
                  onClick={() => {
                    setIsChangePasswordFormOpen(true);
                  }}
                >
                  {t('user_details.change_password.change_password')}
                </ActionMenuItem>
                <ActionMenuItem
                  icon={<Delete />}
                  type="danger"
                  onClick={() => {
                    setIsDeleteFormOpen(true);
                  }}
                >
                  {t('user_details.menu_delete')}
                </ActionMenuItem>
              </ActionMenu>
              <ReactModal
                isOpen={isChangePasswordFormOpen}
                className={modalStyles.content}
                overlayClassName={modalStyles.overlay}
              >
                <ChangePasswordForm
                  userId={data.id}
                  onClose={() => {
                    setIsChangePasswordFormOpen(false);
                  }}
                />
              </ReactModal>
              <ReactModal
                isOpen={isDeleteFormOpen}
                className={modalStyles.content}
                overlayClassName={modalStyles.overlay}
              >
                <DeleteForm
                  id={data.id}
                  onClose={() => {
                    setIsDeleteFormOpen(false);
                  }}
                />
              </ReactModal>
            </div>
          </Card>
          <Card>TBD</Card>
        </>
      )}
      {data && <CreateSuccess username={data.username ?? '-'} />}
    </div>
  );
};

export default UserDetails;
