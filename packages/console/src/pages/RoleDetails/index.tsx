import { appInsightsReact } from '@logto/app-insights/react';
import type { Role } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Card from '@/components/Card';
import ConfirmModal from '@/components/ConfirmModal';
import CopyToClipboard from '@/components/CopyToClipboard';
import DetailsPage from '@/components/DetailsPage';
import TabNav, { TabNavItem } from '@/components/TabNav';
import { RoleDetailsTabs } from '@/consts/page-tabs';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';
import { type RoleDetailsOutletContext } from './types';

function RoleDetails() {
  const { pathname } = useLocation();
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();

  const isPageHasTable =
    pathname.endsWith(RoleDetailsTabs.Permissions) || pathname.endsWith(RoleDetailsTabs.Users);

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
            <div className={styles.info}>
              <div className={styles.name}>{data.name}</div>
              <div className={styles.meta}>
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
            <TabNavItem href={`/roles/${data.id}/${RoleDetailsTabs.Users}`}>
              {t('role_details.users_tab')}
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

export default appInsightsReact.withAppInsights(RoleDetails);
