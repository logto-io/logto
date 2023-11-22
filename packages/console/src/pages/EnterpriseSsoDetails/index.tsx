import { withAppInsights } from '@logto/app-insights/react';
import { Theme, type SsoProviderName } from '@logto/schemas';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg';
import File from '@/assets/icons/file.svg';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Drawer from '@/components/Drawer';
import Markdown from '@/components/Markdown';
import PageMeta from '@/components/PageMeta';
import { EnterpriseSsoDetailsTabs } from '@/consts';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DynamicT from '@/ds-components/DynamicT';
import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';

import { type SsoConnectorWithProviderConfigWithGeneric } from '../EnterpriseSso/types';

import Connection from './Connection';
import Settings from './Settings';
import * as styles from './index.module.scss';

const enterpriseSsoPathname = '/enterprise-sso';
const getSsoConnectorDetailsPathname = (ssoConnectorId: string, tab: EnterpriseSsoDetailsTabs) =>
  `${enterpriseSsoPathname}/${ssoConnectorId}/${tab}`;

function EnterpriseSsoConnectorDetails<T extends SsoProviderName>() {
  const theme = useTheme();

  const { pathname } = useLocation();
  const { ssoConnectorId, tab } = useParams();

  const [isDeleted, setIsDeleted] = useState(false);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    data: ssoConnector,
    error: requestError,
    mutate,
  } = useSWR<SsoConnectorWithProviderConfigWithGeneric<T>, RequestError>(
    ssoConnectorId && `api/sso-connectors/${ssoConnectorId}`,
    { keepPreviousData: true }
  );

  const inUse = Boolean(ssoConnector?.providerConfig);
  const isLoading = !ssoConnector && !requestError;

  const api = useApi();
  const { navigate } = useTenantPathname();

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsDeleteAlertOpen(false);
  }, [pathname]);

  const handleDelete = useCallback(async () => {
    if (!ssoConnectorId || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api
        .delete(`api/sso-connectors/${ssoConnectorId}`)
        .json<SsoConnectorWithProviderConfigWithGeneric<T>>();

      setIsDeleted(true);

      toast.success(t('enterprise_sso_details.enterprise_sso_deleted'));
      navigate(enterpriseSsoPathname);
    } finally {
      setIsDeleting(false);
    }
  }, [api, isDeleting, navigate, ssoConnectorId, t]);

  if (!ssoConnectorId) {
    return null;
  }

  return (
    <DetailsPage
      backLink={enterpriseSsoPathname}
      backLinkTitle="enterprise_sso_details.back_to_sso_connectors"
      isLoading={isLoading}
      error={requestError}
      onRetry={() => {
        void mutate();
      }}
    >
      <PageMeta titleKey="enterprise_sso_details.page_title" />
      {ssoConnector && (
        <>
          <DetailsPageHeader
            icon={
              <ImageWithErrorFallback
                className={styles.logo}
                containerClassName={styles.container}
                alt="logo"
                src={
                  (theme === Theme.Dark && ssoConnector.branding.darkLogo
                    ? ssoConnector.branding.darkLogo
                    : ssoConnector.branding.logo) ?? ssoConnector.providerLogo
                }
              />
            }
            title={ssoConnector.connectorName}
            primaryTag={ssoConnector.providerName}
            statusTag={{
              status: inUse ? 'success' : 'error',
              text: inUse
                ? 'enterprise_sso.col_status_in_use'
                : 'enterprise_sso.col_status_invalid',
            }}
            identifier={{ name: 'ID', value: ssoConnector.id }}
            additionalActionButton={{
              title: 'enterprise_sso_details.check_readme',
              icon: <File />,
              onClick: () => {
                setIsReadmeOpen(true);
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
          <Drawer
            title="enterprise_sso_details.readme_drawer_title"
            subtitle="enterprise_sso_details.readme_drawer_subtitle"
            isOpen={isReadmeOpen}
            onClose={() => {
              setIsReadmeOpen(false);
            }}
          >
            {/* TODO: @darcyYe Add SSO connector README. */}
            <Markdown className={styles.readme}>
              {'# SSO connector guide\n\nThis is a guide for Logto Enterprise SSO connector.'}
            </Markdown>
          </Drawer>
          <TabNav>
            <TabNavItem
              href={getSsoConnectorDetailsPathname(
                ssoConnectorId,
                EnterpriseSsoDetailsTabs.Settings
              )}
            >
              <DynamicT forKey="enterprise_sso_details.tab_settings" />
            </TabNavItem>
            <TabNavItem
              href={getSsoConnectorDetailsPathname(
                ssoConnectorId,
                EnterpriseSsoDetailsTabs.Connection
              )}
            >
              <DynamicT forKey="enterprise_sso_details.tab_connection" />
            </TabNavItem>
          </TabNav>
          {tab === EnterpriseSsoDetailsTabs.Settings && (
            <Settings
              data={ssoConnector}
              isDeleted={isDeleted}
              onUpdated={() => {
                void mutate();
              }}
            />
          )}
          {tab === EnterpriseSsoDetailsTabs.Connection && (
            <Connection
              data={ssoConnector}
              isDeleted={isDeleted}
              onUpdated={(ssoConnector) => {
                void mutate(ssoConnector);
              }}
            />
          )}
          <ConfirmModal
            isOpen={isDeleteAlertOpen}
            isLoading={isDeleting}
            confirmButtonText="general.delete"
            title="enterprise_sso_details.delete_confirm_modal_title"
            onCancel={async () => {
              setIsDeleteAlertOpen(false);
            }}
            onConfirm={handleDelete}
          >
            <DynamicT forKey="enterprise_sso_details.delete_confirm_modal_content" />
          </ConfirmModal>
        </>
      )}
    </DetailsPage>
  );
}

export default withAppInsights(EnterpriseSsoConnectorDetails);
