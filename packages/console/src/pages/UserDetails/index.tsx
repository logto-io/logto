import type { UserProfileResponse, User } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import Forbidden from '@/assets/icons/forbidden.svg?react';
import Reset from '@/assets/icons/reset.svg?react';
import Shield from '@/assets/icons/shield.svg?react';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import PageMeta from '@/components/PageMeta';
import UserAvatar from '@/components/UserAvatar';
import { UserDetailsTabs } from '@/consts/page-tabs';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import modalStyles from '@/scss/modal.module.scss';
import { buildUrl } from '@/utils/url';
import { getUserTitle, getUserSubtitle } from '@/utils/user';

import UserAccountInformation from '../../components/UserAccountInformation';
import SuspendedTag from '../Users/components/SuspendedTag';

import ResetPasswordForm from './components/ResetPasswordForm';
import styles from './index.module.scss';
import { type UserDetailsOutletContext } from './types';

function UserDetails() {
  const { pathname } = useLocation();
  const isPageHasTable =
    pathname.endsWith(UserDetailsTabs.Roles) || pathname.endsWith(UserDetailsTabs.Logs);
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);
  const [isToggleSuspendFormOpen, setIsToggleSuspendFormOpen] = useState(false);
  const [isUpdatingSuspendState, setIsUpdatingSuspendState] = useState(false);
  const [resetResult, setResetResult] = useState<string>();

  // Get user info with user's SSO identities in a single API call.
  const { data, error, mutate } = useSWR<UserProfileResponse, RequestError>(
    id && buildUrl(`api/users/${id}`, { includeSsoIdentities: 'true' })
  );
  const { isSuspended: isSuspendedUser = false } = data ?? {};
  const isLoading = !data && !error;
  const api = useApi();
  const { navigate } = useTenantPathname();

  const userSubtitle = data && getUserSubtitle(data);

  useEffect(() => {
    setIsDeleteFormOpen(false);
    setIsResetPasswordFormOpen(false);
    setIsToggleSuspendFormOpen(false);
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

  const onToggleSuspendState = async () => {
    if (!data || isUpdatingSuspendState) {
      return;
    }

    setIsUpdatingSuspendState(true);

    try {
      const updatedUser = await api
        .patch(`api/users/${data.id}/is-suspended`, { json: { isSuspended: !isSuspendedUser } })
        .json<User>();
      void mutate(updatedUser);
      setIsToggleSuspendFormOpen(false);
      toast.success(
        t(updatedUser.isSuspended ? 'user_details.user_suspended' : 'user_details.user_reactivated')
      );
    } finally {
      setIsUpdatingSuspendState(false);
    }
  };

  return (
    <DetailsPage
      backLink="/users"
      backLinkTitle="user_details.back_to_users"
      isLoading={isLoading}
      error={error}
      className={classNames(isPageHasTable && styles.resourceLayout)}
      onRetry={mutate}
    >
      <PageMeta titleKey="user_details.page_title" />
      {data && (
        <>
          <DetailsPageHeader
            icon={<UserAvatar user={data} size="xlarge" />}
            title={getUserTitle(data)}
            subtitle={userSubtitle}
            primaryTag={isSuspendedUser && <SuspendedTag />}
            identifier={{ name: 'User ID', value: data.id }}
            actionMenuItems={[
              {
                title: 'user_details.reset_password.reset_password',
                icon: <Reset />,
                onClick: () => {
                  setIsResetPasswordFormOpen(true);
                },
              },
              {
                title: isSuspendedUser
                  ? 'user_details.reactivate_user'
                  : 'user_details.suspend_user',
                icon: isSuspendedUser ? <Shield /> : <Forbidden />,
                onClick: () => {
                  setIsToggleSuspendFormOpen(true);
                },
              },
              {
                title: 'general.delete',
                type: 'danger',
                icon: <Delete />,
                onClick: () => {
                  setIsDeleteFormOpen(true);
                },
              },
            ]}
          />
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
          <ConfirmModal
            isOpen={isToggleSuspendFormOpen}
            isLoading={isUpdatingSuspendState}
            confirmButtonText={
              isSuspendedUser ? 'user_details.reactivate_action' : 'user_details.suspend_action'
            }
            onCancel={() => {
              setIsToggleSuspendFormOpen(false);
            }}
            onConfirm={onToggleSuspendState}
          >
            {t(
              isSuspendedUser
                ? 'user_details.reactivate_user_reminder'
                : 'user_details.suspend_user_reminder'
            )}
          </ConfirmModal>
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
            <TabNavItem href={`/users/${data.id}/${UserDetailsTabs.Organizations}`}>
              {t('user_details.tab_organizations')}
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
              user={data}
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

export default UserDetails;
