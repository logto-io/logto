import type { User } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import Reset from '@/assets/images/reset.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DetailsPage from '@/components/DetailsPage';
import TabNav, { TabNavItem } from '@/components/TabNav';
import UserAvatar from '@/components/UserAvatar';
import { UserDetailsTabs } from '@/consts/page-tabs';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { withAppInsights } from '@/utils/app-insights';

import UserAccountInformation from '../../components/UserAccountInformation';
import ResetPasswordForm from './components/ResetPasswordForm';
import * as styles from './index.module.scss';
import { UserDetailsOutletContext } from './types';

function UserDetails() {
  const { pathname } = useLocation();
  const isPageHasTable =
    pathname.endsWith(UserDetailsTabs.Roles) || pathname.endsWith(UserDetailsTabs.Logs);
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);
  const [resetResult, setResetResult] = useState<string>();

  const { data, error, mutate } = useSWR<User, RequestError>(id && `api/users/${id}`);
  const isLoading = !data && !error;
  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    setIsDeleteFormOpen(false);
    setIsResetPasswordFormOpen(false);
  }, [pathname]);

  const onDelete = async () => {
    if (!data || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`api/users/${data.id}`);
      toast.success(t('user_details.deleted', { name: data.name }));
      navigate('/users');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DetailsPage
      backLink="/users"
      backLinkTitle="user_details.back_to_users"
      isLoading={isLoading}
      error={error}
      className={classNames(isPageHasTable && styles.resourceLayout)}
      onRetry={() => {
        void mutate();
      }}
    >
      {data && (
        <>
          <Card className={styles.header}>
            <UserAvatar user={data} size="xlarge" />
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name ?? '-'}</div>
              <div>
                {data.isSuspended && (
                  <div className={styles.suspended}>{t('user_details.suspended')}</div>
                )}
                {data.username && (
                  <>
                    <div className={styles.username}>{data.username}</div>
                    <div className={styles.verticalBar} />
                  </>
                )}
                <div className={styles.text}>User ID</div>
                <CopyToClipboard size="small" value={data.id} />
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
                shouldCloseOnEsc
                isOpen={isResetPasswordFormOpen}
                className={modalStyles.content}
                overlayClassName={modalStyles.overlay}
                onRequestClose={() => {
                  setIsResetPasswordFormOpen(false);
                }}
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
              <DeleteConfirmModal
                isOpen={isDeleteFormOpen}
                isLoading={isDeleting}
                onCancel={() => {
                  setIsDeleteFormOpen(false);
                }}
                onConfirm={onDelete}
              >
                <div>{t('user_details.delete_description')}</div>
              </DeleteConfirmModal>
            </div>
          </Card>
          <TabNav>
            <TabNavItem href={`/users/${data.id}/${UserDetailsTabs.Settings}`}>
              {t('user_details.tab_settings')}
            </TabNavItem>
            <TabNavItem href={`/users/${data.id}/${UserDetailsTabs.Roles}`}>
              {t('user_details.tab_roles')}
            </TabNavItem>
            <TabNavItem href={`/users/${data.id}/${UserDetailsTabs.Logs}`}>
              {t('user_details.tab_logs')}
            </TabNavItem>
          </TabNav>
          <Outlet
            context={
              {
                user: data,
                isDeleting,
                onUserUpdated: (user) => {
                  void mutate(user);
                },
              } satisfies UserDetailsOutletContext
            }
          />
          {resetResult && (
            <UserAccountInformation
              title="user_details.reset_password.congratulations"
              username={data.username ?? '-'}
              password={resetResult}
              passwordLabel={t('user_details.reset_password.new_password')}
              onClose={() => {
                setResetResult(undefined);
              }}
            />
          )}
        </>
      )}
    </DetailsPage>
  );
}

export default withAppInsights(UserDetails);
