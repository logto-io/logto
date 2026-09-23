import { type consoleSsoRouter } from '@logto/cloud/routes';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';

import Delete from '@/assets/icons/delete.svg?react';
import File from '@/assets/icons/file.svg?react';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Skeleton from '@/components/DetailsPage/Skeleton';
import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import AppBoundary from '@/containers/AppBoundary';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useCurrentUser from '@/hooks/use-current-user';
import SsoConnectorLogo from '@/pages/EnterpriseSso/SsoConnectorLogo';
import connectorStyles from '@/pages/EnterpriseSsoDetails/index.module.scss';

import { toastResponseError, useCloudApi } from '../../../hooks/use-cloud-api';
import { useConsoleSsoConnector, useConsoleSsoConnectors } from '../use-console-sso';

import Connection from './Connection';
import Experience from './Experience';
import styles from './index.module.scss';
import { ConsoleSsoDetailsTab, getConsoleSsoDetailsPath } from './paths';

function Details() {
  const { connectorId, tab } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { user, error: userError } = useCurrentUser();
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const { data, error, isLoading, mutate } = useConsoleSsoConnector(connectorId);
  const { mutate: mutateList } = useConsoleSsoConnectors();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (!connectorId) {
    return <Navigate replace to={GlobalRoute.ConsoleSso} />;
  }
  if (tab !== ConsoleSsoDetailsTab.Connection && tab !== ConsoleSsoDetailsTab.Experience) {
    return <Navigate replace to={getConsoleSsoDetailsPath(connectorId)} />;
  }

  const refresh = async () => {
    await Promise.allSettled([mutate(), mutateList()]);
  };
  const onDelete = async () => {
    if (isDeleting) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.delete('/api/me/console-sso/connectors/:connectorId', {
        params: { connectorId },
      });
      toast.success(t('enterprise_sso_details.enterprise_sso_deleted'));
      await refresh();
      setIsDeleted(true);
    } catch (error) {
      await refresh();
      await toastResponseError(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteAlertOpen(false);
    }
  };

  if (isDeleted) {
    return <Navigate replace to={GlobalRoute.ConsoleSso} />;
  }

  return (
    <AppBoundary>
      <div className={styles.pageContainer}>
        <PageMeta titleKey="cloud.console_sso.title" />
        <Topbar hideTenantSelector hideTitle />
        <OverlayScrollbar className={styles.scrollable}>
          <div className={styles.wrapper}>
            <DetailsPage
              isGlobal
              backLink={GlobalRoute.ConsoleSso}
              backLinkTitle="cloud.console_sso.back_to_list"
            >
              {(!user && !userError) || isLoading ? <Skeleton /> : null}
              {error && (
                <InlineNotification severity="error">
                  {error.message}
                  <Button
                    title="general.retry"
                    onClick={async () => {
                      await refresh();
                    }}
                  />
                </InlineNotification>
              )}
              {user && !error && data && (
                <>
                  <DetailsPageHeader
                    icon={
                      <SsoConnectorLogo
                        className={connectorStyles.logo}
                        containerClassName={connectorStyles.container}
                        data={data}
                      />
                    }
                    title={
                      data.branding.displayName?.trim()
                        ? data.branding.displayName
                        : data.connectorName
                    }
                    primaryTag={data.name}
                    identifier={{ name: 'ID', value: data.id }}
                    additionalActionButton={{
                      title: 'enterprise_sso_details.check_connection_guide',
                      icon: <File />,
                      onClick: () => {
                        // TODO (LOG-14299): Open the localized docs-site connection guide.
                      },
                    }}
                    actionMenuItems={[
                      {
                        type: 'danger',
                        title: 'general.delete',
                        icon: <Delete />,
                        onClick: () => {
                          setIsDeleteAlertOpen(true);
                        },
                      },
                    ]}
                  />
                  <TabNav>
                    <TabNavItem isGlobal href={getConsoleSsoDetailsPath(connectorId)}>
                      <DynamicT forKey="enterprise_sso_details.tab_connection" />
                    </TabNavItem>
                    <TabNavItem
                      isGlobal
                      href={getConsoleSsoDetailsPath(connectorId, ConsoleSsoDetailsTab.Experience)}
                    >
                      <DynamicT forKey="enterprise_sso_details.tab_experience" />
                    </TabNavItem>
                  </TabNav>
                  {tab === ConsoleSsoDetailsTab.Connection && (
                    <Connection data={data} isDeleted={isDeleted} onUpdated={refresh} />
                  )}
                  {tab === ConsoleSsoDetailsTab.Experience && (
                    <Experience data={data} isDeleted={isDeleted} onUpdated={refresh} />
                  )}
                  <ConfirmModal
                    isOpen={isDeleteAlertOpen}
                    isLoading={isDeleting}
                    confirmButtonText="general.delete"
                    title="enterprise_sso_details.delete_confirm_modal_title"
                    onCancel={async () => {
                      setIsDeleteAlertOpen(false);
                    }}
                    onConfirm={onDelete}
                  >
                    <DynamicT forKey="enterprise_sso_details.delete_confirm_modal_content" />
                  </ConfirmModal>
                </>
              )}
            </DetailsPage>
          </div>
        </OverlayScrollbar>
      </div>
    </AppBoundary>
  );
}

export default Details;
