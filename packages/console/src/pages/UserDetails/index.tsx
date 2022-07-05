import { User } from '@logto/schemas';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import LinkButton from '@/components/LinkButton';
import TabNav, { TabNavItem } from '@/components/TabNav';
import { generateAvatarPlaceHolderById } from '@/consts/avatars';
import { RequestError } from '@/hooks/use-api';
import Back from '@/icons/Back';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import Reset from '@/icons/Reset';
import * as detailsStyles from '@/scss/details.module.scss';
import * as modalStyles from '@/scss/modal.module.scss';

import CreateSuccess from './components/CreateSuccess';
import DeleteForm from './components/DeleteForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import UserLogs from './components/UserLogs';
import UserSettingsForm from './components/UserSettingsForm';
import * as styles from './index.module.scss';

const UserDetails = () => {
  const location = useLocation();
  const isLogs = location.pathname.endsWith('/logs');
  const { userId } = useParams();
  const [searchParameters, setSearchParameters] = useSearchParams();
  const passwordEncoded = searchParameters.get('password');
  const password = passwordEncoded && atob(passwordEncoded);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);
  const [resetResult, setResetResult] = useState<string>();

  const { data, error, mutate } = useSWR<User, RequestError>(userId && `/api/users/${userId}`);
  const isLoading = !data && !error;

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to="/users"
        icon={<Back />}
        title="admin_console.user_details.back_to_users"
        className={styles.backLink}
      />
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {userId && data && (
        <>
          <Card className={styles.header}>
            <img
              className={styles.avatar}
              src={data.avatar || generateAvatarPlaceHolderById(userId)}
            />
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name ?? '-'}</div>
              <div>
                {data.username && (
                  <>
                    <div className={styles.username}>{data.username}</div>
                    <div className={styles.verticalBar} />
                  </>
                )}
                <div className={styles.text}>User ID</div>
                <CopyToClipboard value={data.id} />
              </div>
            </div>
            <div>
              <ActionMenu
                buttonProps={{ icon: <More className={styles.moreIcon} />, size: 'large' }}
                title={t('general.more_options')}
              >
                <ActionMenuItem
                  icon={<Reset />}
                  iconClassName={styles.resetIcon}
                  onClick={() => {
                    setIsResetPasswordFormOpen(true);
                  }}
                >
                  {t('user_details.reset_password.reset_password')}
                </ActionMenuItem>
                <ActionMenuItem
                  icon={<Delete />}
                  type="danger"
                  onClick={() => {
                    setIsDeleteFormOpen(true);
                  }}
                >
                  {t('general.delete')}
                </ActionMenuItem>
              </ActionMenu>
              <ReactModal
                isOpen={isResetPasswordFormOpen}
                className={modalStyles.content}
                overlayClassName={modalStyles.overlay}
              >
                <ResetPasswordForm
                  userId={data.id}
                  onClose={(password) => {
                    setIsResetPasswordFormOpen(false);

                    if (password) {
                      setResetResult(password);
                    }
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
          <Card className={classNames(styles.body, detailsStyles.body)}>
            <TabNav>
              <TabNavItem href={`/users/${userId}`}>{t('general.settings_nav')}</TabNavItem>
              <TabNavItem href={`/users/${userId}/logs`}>{t('user_details.tab_logs')}</TabNavItem>
            </TabNav>
            {isLogs && <UserLogs userId={data.id} />}
            {!isLogs && (
              <UserSettingsForm
                data={data}
                onMutate={(user) => {
                  void mutate(user);
                }}
              />
            )}
          </Card>
        </>
      )}
      {data && password && (
        <CreateSuccess
          title="user_details.created_title"
          username={data.username ?? '-'}
          password={password}
          onClose={() => {
            setSearchParameters({});
          }}
        />
      )}
      {data && resetResult && (
        <CreateSuccess
          title="user_details.reset_password.congratulations"
          username={data.username ?? '-'}
          password={resetResult}
          passwordLabel={t('user_details.reset_password.new_password')}
          onClose={() => {
            setResetResult(undefined);
          }}
        />
      )}
    </div>
  );
};

export default UserDetails;
