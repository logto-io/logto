import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Delete from '@/assets/icons/delete.svg?react';
import File from '@/assets/icons/file.svg?react';
import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type ConsoleSsoConnector } from '@/cloud/types/router';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Drawer from '@/components/Drawer';
import ConfirmModal from '@/ds-components/ConfirmModal';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import SsoConnectorLogo from '@/pages/EnterpriseSso/SsoConnectorLogo';
import Connection from '@/pages/EnterpriseSsoDetails/Connection';
import Experience from '@/pages/EnterpriseSsoDetails/Experience';
import SsoGuide from '@/pages/EnterpriseSsoDetails/SsoGuide';
import connectorStyles from '@/pages/EnterpriseSsoDetails/index.module.scss';

import DomainTags from './DomainTags';
import {
  consoleSsoPath,
  useConsoleSsoContext,
  useConsoleSsoConnector,
  useConsoleSsoConnectors,
} from './use-console-sso';

function Details() {
  const { connectorId, tab } = useParams();
  const navigate = useNavigate();
  const { api, data: context, error: contextError } = useConsoleSsoContext();
  const { data, error, isLoading, mutate } = useConsoleSsoConnector(connectorId);
  const { mutate: refreshList } = useConsoleSsoConnectors();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const save = useCallback(
    async (
      body: Partial<
        Pick<ConsoleSsoConnector, 'config' | 'branding' | 'syncProfile' | 'enableTokenStorage'>
      >
    ) => {
      if (!connectorId) {
        return;
      }
      try {
        const updated = await api.patch('/api/me/console-sso/connectors/:connectorId', {
          params: { connectorId },
          body,
        });
        await mutate(updated, { revalidate: false });
        void refreshList();
      } catch (error) {
        await Promise.allSettled([mutate(), refreshList()]);
        await toastResponseError(error);
        throw error;
      }
    },
    [api, connectorId, mutate, refreshList]
  );
  const experienceData = useMemo(() => data && { ...data, domains: data.boundDomains }, [data]);
  const remove = async () => {
    if (!connectorId || isDeleting) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.delete('/api/me/console-sso/connectors/:connectorId', { params: { connectorId } });
      setIsDeleted(true);
      void refreshList();
    } catch (error) {
      await Promise.allSettled([mutate(), refreshList()]);
      await toastResponseError(error);
    } finally {
      setIsDeleting(false);
    }
  };
  useEffect(() => {
    if (isDeleted) {
      navigate(consoleSsoPath);
    }
  }, [isDeleted, navigate]);

  return (
    <DetailsPage
      error={error ?? contextError}
      backLink={consoleSsoPath}
      backLinkTitle="console_sso.back_to_subscription"
      isLoading={isLoading || (!context && !contextError)}
      onRetry={() => {
        void mutate();
      }}
    >
      {(error ?? contextError) ? (
        <InlineNotification severity="error">
          {error?.message ?? contextError?.message}
        </InlineNotification>
      ) : (
        data &&
        context && (
          <>
            <DetailsPageHeader
              icon={
                <SsoConnectorLogo
                  data={data}
                  className={connectorStyles.logo}
                  containerClassName={connectorStyles.container}
                />
              }
              title={data.branding.displayName ?? data.name}
              primaryTag={data.name}
              additionalActionButton={{
                title: 'enterprise_sso_details.check_connection_guide',
                icon: <File />,
                onClick: () => {
                  setIsGuideOpen(true);
                },
              }}
              actionMenuItems={[
                {
                  type: 'danger',
                  title: 'general.delete',
                  icon: <Delete />,
                  onClick: () => {
                    setIsDeleteOpen(true);
                  },
                },
              ]}
            />
            <Drawer
              title="enterprise_sso_details.readme_drawer_title"
              subtitle="enterprise_sso_details.readme_drawer_subtitle"
              isOpen={isGuideOpen}
              onClose={() => {
                setIsGuideOpen(false);
              }}
            >
              <SsoGuide isGlobal ssoConnector={data} redirectUri={data.redirectUri} />
            </Drawer>
            <TabNav>
              <TabNavItem
                isActive={tab === 'connection'}
                onClick={() => {
                  navigate(`${consoleSsoPath}/${data.id}/connection`);
                }}
              >
                <DynamicT forKey="enterprise_sso_details.tab_connection" />
              </TabNavItem>
              <TabNavItem
                isActive={tab === 'experience'}
                onClick={() => {
                  navigate(`${consoleSsoPath}/${data.id}/experience`);
                }}
              >
                <DynamicT forKey="enterprise_sso_details.tab_experience" />
              </TabNavItem>
            </TabNav>
            {tab === 'connection' && (
              <Connection
                key={`${context.userId}:${data.stripeCustomerId}:${data.id}`}
                data={data}
                isDeleted={isDeleted}
                isSigningKeyManagementEnabled={false}
                isDomainSelectionEnabled={false}
                oidcServiceProviderInfo={
                  <FormField title="enterprise_sso.basic_info.oidc.redirect_uri_field_name">
                    {data.redirectUri && (
                      <CopyToClipboard
                        displayType="block"
                        variant="border"
                        value={data.redirectUri}
                      />
                    )}
                  </FormField>
                }
                onSave={async (config) => save({ config })}
              />
            )}
            {tab === 'experience' && experienceData && (
              <Experience
                key={`${context.userId}:${data.stripeCustomerId}:${data.id}`}
                isDarkModeEnabled
                data={experienceData}
                isDeleted={isDeleted}
                isConnectorNameEditable={false}
                isLogoUploadEnabled={false}
                domainField={
                  <FormField title="enterprise_sso_details.email_domain_field_name">
                    <DomainTags data={data} />
                    <InlineNotification severity="info">
                      <DynamicT forKey="console_sso.scope_description" />
                    </InlineNotification>
                  </FormField>
                }
                onSave={save}
              />
            )}
            <ConfirmModal
              isOpen={isDeleteOpen}
              isLoading={isDeleting}
              confirmButtonText="general.delete"
              title="enterprise_sso_details.delete_confirm_modal_title"
              onCancel={async () => {
                setIsDeleteOpen(false);
              }}
              onConfirm={remove}
            >
              <DynamicT forKey="console_sso.delete_confirmation" />
            </ConfirmModal>
          </>
        )
      )}
    </DetailsPage>
  );
}

export default Details;
