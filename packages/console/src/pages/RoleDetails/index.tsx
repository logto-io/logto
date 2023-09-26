import { withAppInsights } from '@logto/app-insights/react';
import type { Role } from '@logto/schemas';
import { Theme, RoleType } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg';
import MachineToMachineRoleIconDark from '@/assets/icons/m2m-role-dark.svg';
import MachineToMachineRoleIcon from '@/assets/icons/m2m-role.svg';
import More from '@/assets/icons/more.svg';
import UserRoleIconDark from '@/assets/icons/user-role-dark.svg';
import UserRoleIcon from '@/assets/icons/user-role.svg';
import DetailsPage from '@/components/DetailsPage';
import { RoleDetailsTabs } from '@/consts/page-tabs';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import Card from '@/ds-components/Card';
import ConfirmModal from '@/ds-components/ConfirmModal';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import Tag from '@/ds-components/Tag';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';
import { type RoleDetailsOutletContext } from './types';

const getRoleIcon = (type: RoleType, isDarkMode: boolean) => {
  if (type === RoleType.User) {
    return isDarkMode ? (
      <UserRoleIconDark className={styles.icon} />
    ) : (
      <UserRoleIcon className={styles.icon} />
    );
  }

  return isDarkMode ? (
    <MachineToMachineRoleIconDark className={styles.icon} />
  ) : (
    <MachineToMachineRoleIcon className={styles.icon} />
  );
};

function RoleDetails() {
  const { pathname } = useLocation();
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const theme = useTheme();

  const isPageHasTable =
    pathname.endsWith(RoleDetailsTabs.Permissions) ||
    pathname.endsWith(RoleDetailsTabs.Users) ||
    pathname.endsWith(RoleDetailsTabs.M2mApps);

  const { data, error, mutate } = useSWR<Role, RequestError>(id && `api/roles/${id}`);
  const { mutate: mutateGlobal } = useSWRConfig();
  const isLoading = !data && !error;

  const [isDeletionAlertOpen, setIsDeletionAlertOpen] = useState(false);

  useEffect(() => {
    setIsDeletionAlertOpen(false);
  }, [pathname]);

  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const handleDelete = async () => {
    if (!data) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`api/roles/${data.id}`);
      toast.success(t('role_details.role_deleted', { name: data.name }));
      await mutateGlobal('api/roles');
      navigate('/roles', { replace: true });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DetailsPage
      backLink="/roles"
      backLinkTitle="role_details.back_to_roles"
      isLoading={isLoading}
      error={error}
      className={classNames(isPageHasTable && styles.withTable)}
      onRetry={mutate}
    >
      {data && (
        <>
          <Card className={styles.header}>
            {getRoleIcon(data.type, theme === Theme.Dark)}
            <div className={styles.info}>
              <div className={styles.name}>{data.name}</div>
              <div className={styles.meta}>
                <Tag>
                  {t(
                    data.type === RoleType.User
                      ? 'role_details.type_user_role_tag'
                      : 'role_details.type_m2m_role_tag'
                  )}
                </Tag>
                <div className={styles.verticalBar} />
                <div className={styles.idText}>{t('role_details.identifier')}</div>
                <CopyToClipboard value={data.id} size="small" />
              </div>
            </div>
            <ActionMenu
              buttonProps={{ icon: <More className={styles.moreIcon} />, size: 'large' }}
              title={t('general.more_options')}
            >
              <ActionMenuItem
                icon={<Delete />}
                type="danger"
                onClick={() => {
                  setIsDeletionAlertOpen(true);
                }}
              >
                {t('general.delete')}
              </ActionMenuItem>
            </ActionMenu>
            <ConfirmModal
              isOpen={isDeletionAlertOpen}
              isLoading={isDeleting}
              confirmButtonText="general.delete"
              onCancel={() => {
                setIsDeletionAlertOpen(false);
              }}
              onConfirm={handleDelete}
            >
              {t('role_details.delete_description')}
            </ConfirmModal>
          </Card>
          <TabNav>
            <TabNavItem href={`/roles/${data.id}/${RoleDetailsTabs.Settings}`}>
              {t('role_details.settings_tab')}
            </TabNavItem>
            <TabNavItem href={`/roles/${data.id}/${RoleDetailsTabs.Permissions}`}>
              {t('role_details.permissions_tab')}
            </TabNavItem>
            <TabNavItem
              href={`/roles/${data.id}/${
                data.type === RoleType.User ? RoleDetailsTabs.Users : RoleDetailsTabs.M2mApps
              }`}
            >
              {t(
                data.type === RoleType.User ? 'role_details.users_tab' : 'role_details.m2m_apps_tab'
              )}
            </TabNavItem>
          </TabNav>
          <Outlet
            context={
              {
                role: data,
                isDeleting,
                onRoleUpdated: (role: Role) => {
                  void mutate(role);
                },
              } satisfies RoleDetailsOutletContext
            }
          />
        </>
      )}
    </DetailsPage>
  );
}

export default withAppInsights(RoleDetails);
