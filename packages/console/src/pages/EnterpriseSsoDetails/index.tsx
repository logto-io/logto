import { withAppInsights } from '@logto/app-insights/react';
import { type SignInExperience, type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { pick } from '@silverhand/essentials';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg';
import File from '@/assets/icons/file.svg';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Skeleton from '@/components/DetailsPage/Skeleton';
import Drawer from '@/components/Drawer';
import PageMeta from '@/components/PageMeta';
import { EnterpriseSsoDetailsTabs } from '@/consts';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import type { RequestError } from '@/hooks/use-api';
import useUserAssetsService from '@/hooks/use-user-assets-service';

import SsoConnectorLogo from '../EnterpriseSso/SsoConnectorLogo';

import Connection from './Connection';
import Experience from './Experience';
import SsoGuide from './SsoGuide';
import { enterpriseSsoPathname } from './config';
import * as styles from './index.module.scss';
import useDeleteConnector from './use-delete-connector';

const getSsoConnectorDetailsPathname = (ssoConnectorId: string, tab: EnterpriseSsoDetailsTabs) =>
  `${enterpriseSsoPathname}/${ssoConnectorId}/${tab}`;

function EnterpriseSsoConnectorDetails() {
  const { pathname } = useLocation();
  const { ssoConnectorId, tab } = useParams();

  const { isDeleted, isDeleting, onDeleteHandler } = useDeleteConnector(ssoConnectorId);

  const [isReadmeOpen, setIsReadmeOpen] = useState(false);

  const { isLoading: isUserAssetServiceLoading } = useUserAssetsService();

  const { data: signInExperience, isLoading: isSignInExperienceLoading } =
    useSWR<SignInExperience>('api/sign-in-exp');

  const {
    data: ssoConnector,
    error: requestError,
    mutate,
    isLoading: isSsoConnectorLoading,
  } = useSWR<SsoConnectorWithProviderConfig, RequestError>(
    ssoConnectorId && `api/sso-connectors/${ssoConnectorId}`,
    { keepPreviousData: true }
  );

  const isLoading = isSsoConnectorLoading || isUserAssetServiceLoading || isSignInExperienceLoading;

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const isDarkModeEnabled = signInExperience?.color.isDarkModeEnabled ?? false;

  useEffect(() => {
    setIsDeleteAlertOpen(false);
  }, [pathname]);

  if (!ssoConnectorId) {
    return null;
  }

  return (
    <DetailsPage
      backLink={enterpriseSsoPathname}
      backLinkTitle="enterprise_sso_details.back_to_sso_connectors"
      error={requestError}
      onRetry={() => {
        void mutate();
      }}
    >
      <PageMeta titleKey="enterprise_sso_details.page_title" />
      {isLoading && <Skeleton />}
      {!isLoading && ssoConnector && (
        <>
          <DetailsPageHeader
            icon={
              <SsoConnectorLogo
                className={styles.logo}
                containerClassName={styles.container}
                data={pick(ssoConnector, 'providerLogo', 'providerLogoDark', 'branding')}
              />
            }
            title={ssoConnector.connectorName}
            primaryTag={ssoConnector.name}
            identifier={{ name: 'ID', value: ssoConnector.id }}
            additionalActionButton={{
              title: 'enterprise_sso_details.check_connection_guide',
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
            <SsoGuide ssoConnector={ssoConnector} className={styles.readme} />
          </Drawer>
          <TabNav>
            <TabNavItem
              href={getSsoConnectorDetailsPathname(
                ssoConnectorId,
                EnterpriseSsoDetailsTabs.Connection
              )}
            >
              <DynamicT forKey="enterprise_sso_details.tab_connection" />
            </TabNavItem>
            <TabNavItem
              href={getSsoConnectorDetailsPathname(
                ssoConnectorId,
                EnterpriseSsoDetailsTabs.Experience
              )}
            >
              <DynamicT forKey="enterprise_sso_details.tab_experience" />
            </TabNavItem>
          </TabNav>
          {tab === EnterpriseSsoDetailsTabs.Experience && (
            <Experience
              data={ssoConnector}
              isDeleted={isDeleted}
              isDarkModeEnabled={isDarkModeEnabled}
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
            onConfirm={onDeleteHandler}
          >
            <DynamicT forKey="enterprise_sso_details.delete_confirm_modal_content" />
          </ConfirmModal>
        </>
      )}
    </DetailsPage>
  );
}

export default withAppInsights(EnterpriseSsoConnectorDetails);
