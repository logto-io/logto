import { type SnakeCaseOidcConfig, Theme } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import DynamicAppDarkIcon from '@/assets/icons/dynamic-app-dark.svg?react';
import DynamicAppIcon from '@/assets/icons/dynamic-app.svg?react';
import Forbidden from '@/assets/icons/forbidden.svg?react';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import PageMeta from '@/components/PageMeta';
import { ApplicationDetailsTabs } from '@/consts';
import { openIdProviderConfigPath } from '@/consts/oidc';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TabWrapper from '@/ds-components/TabWrapper';
import { type RequestError } from '@/hooks/use-api';
import useDynamicApp from '@/hooks/use-dynamic-app';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import { applicationTypeI18nKey, dynamicAppId } from '@/types/applications';

import DisableDynamicAppModal from './DisableDynamicAppModal';
import EndpointsAndCredentials from './EndpointsAndCredentials';
import Permissions from './Permissions';
import Settings from './Settings';
import styles from './index.module.scss';

const thirdPartyApplicationsPathname = '/applications/third-party-applications';

/**
 * The details page of the dynamic app (CIMD). It is a tenant-level feature switch instead of an
 * application, so the page reads the config rather than an application record.
 */
function DynamicAppDetails() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();
  const { getTo } = useTenantPathname();
  const theme = useTheme();

  const config = useDynamicApp();
  const oidcConfig = useSWR<SnakeCaseOidcConfig, RequestError>(openIdProviderConfigPath);
  const [isDisabling, setIsDisabling] = useState(false);

  const isLoading = config.isLoading || (!oidcConfig.data && !oidcConfig.error);
  const requestError = config.error ?? oidcConfig.error;
  const Icon = theme === Theme.Light ? DynamicAppIcon : DynamicAppDarkIcon;

  /** A failed config request is an error to show, only a successful one can rule the feature out. */
  if (!isLoading && !requestError && !config.enabled) {
    return <Navigate replace to={getTo(thirdPartyApplicationsPathname)} />;
  }

  return (
    <DetailsPage
      backLink={thirdPartyApplicationsPathname}
      backLinkTitle="application_details.back_to_applications"
      isLoading={isLoading}
      error={requestError}
      onRetry={() => {
        void config.mutate();
        void oidcConfig.mutate();
      }}
    >
      <PageMeta titleKey="application_details.page_title" />
      <DetailsPageHeader
        icon={<Icon />}
        title={t('applications.dynamic_app.title')}
        primaryTag={[
          t(`${applicationTypeI18nKey.thirdParty}.title`),
          t('applications.dynamic_app.subtitle'),
        ]}
        actionMenuItems={[
          {
            type: 'danger',
            title: 'general.disable',
            icon: <Forbidden />,
            onClick: () => {
              setIsDisabling(true);
            },
          },
        ]}
      />
      {isDisabling && (
        <DisableDynamicAppModal
          onClose={() => {
            setIsDisabling(false);
          }}
        />
      )}
      <TabNav>
        <TabNavItem href={`/applications/${dynamicAppId}/${ApplicationDetailsTabs.Settings}`}>
          {t('application_details.settings')}
        </TabNavItem>
        <TabNavItem href={`/applications/${dynamicAppId}/${ApplicationDetailsTabs.Permissions}`}>
          {t('application_details.permissions.name')}
        </TabNavItem>
      </TabNav>
      <TabWrapper
        isActive={tab === ApplicationDetailsTabs.Settings}
        className={styles.tabContainer}
      >
        <div className={styles.container}>
          <Settings />
          {oidcConfig.data && <EndpointsAndCredentials oidcConfig={oidcConfig.data} />}
        </div>
      </TabWrapper>
      <TabWrapper
        isActive={tab === ApplicationDetailsTabs.Permissions}
        className={styles.tabContainer}
      >
        <div className={styles.container}>
          <Permissions />
        </div>
      </TabWrapper>
    </DetailsPage>
  );
}

export default DynamicAppDetails;
