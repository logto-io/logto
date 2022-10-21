import type { User } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Back from '@/assets/images/back.svg';
import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import Reset from '@/assets/images/reset.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import LinkButton from '@/components/LinkButton';
import TabNav, { TabNavItem } from '@/components/TabNav';
import { generatedPasswordStorageKey } from '@/consts';
import { generateAvatarPlaceHolderById } from '@/consts/avatars';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import * as detailsStyles from '@/scss/details.module.scss';
import * as modalStyles from '@/scss/modal.module.scss';

import CreateSuccess from './components/CreateSuccess';
import ResetPasswordForm from './components/ResetPasswordForm';
import UserLogs from './components/UserLogs';
import UserSettings from './components/UserSettings';
import * as styles from './index.module.scss';

const UserDetails = () => {
  const location = useLocation();
  const isLogs = location.pathname.endsWith('/logs');
  const { userId } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);
  const [resetResult, setResetResult] = useState<string>();
  const [password, setPassword] = useState(sessionStorage.getItem(generatedPasswordStorageKey));

  const { data, error, mutate } = useSWR<User, RequestError>(userId && `/api/users/${userId}`);
  const isLoading = !data && !error;
  const api = useApi();
  const navigate = useNavigate();

  const userFormData = useMemo(() => {
    if (!data) {
      return;
    }

    return {
      ...data,
      customData: JSON.stringify(data.customData, null, 2),
    };
  }, [data]);

  const onDelete = async () => {
    if (!data || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`/api/users/${data.id}`);
      setIsDeleted(true);
      setIsDeleting(false);
      setIsDeleteFormOpen(false);
      toast.success(t('user_details.deleted', { name: data.name }));
      navigate('/users');
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to="/users"
        icon={<Back />}
        title="user_details.back_to_users"
        className={styles.backLink}
      />
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {userId && data && (
        <>
          <Card className={styles.header}>
            {/**
             * Some social connectors like Google will block the references to its image resource,
             * without specifying the referrerPolicy attribute. Reference:
             * https://stackoverflow.com/questions/40570117/http403-forbidden-error-when-trying-to-load-img-src-with-google-profile-pic
             */}
            <img
              className={styles.avatar}
              src={data.avatar ?? generateAvatarPlaceHolderById(userId)}
              referrerPolicy="no-referrer"
              alt="avatar"
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
          <Card className={classNames(styles.body, detailsStyles.body)}>
            <TabNav>
              <TabNavItem href={`/users/${userId}`}>{t('general.settings_nav')}</TabNavItem>
              <TabNavItem href={`/users/${userId}/logs`}>{t('user_details.tab_logs')}</TabNavItem>
            </TabNav>
            {isLogs && <UserLogs userId={data.id} />}
            {!isLogs && userFormData && (
              <UserSettings
                userData={data}
                userFormData={userFormData}
                isDeleted={isDeleted}
                onUserUpdated={(user) => {
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
            setPassword(null);
            sessionStorage.removeItem(generatedPasswordStorageKey);
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
