import type { ConnectorResponse } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoutes } from 'react-router-dom';
import useSWRImmutable from 'swr/immutable';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { adminTenantEndpoint, meApi } from '@/consts';
import { isCloud } from '@/consts/env';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import type { RequestError } from '@/hooks/use-api';
import { useStaticApi } from '@/hooks/use-api';
import { profile } from '@/hooks/use-console-routes/routes/profile';
import useCurrentUser from '@/hooks/use-current-user';
import { usePlausiblePageview } from '@/hooks/use-plausible-pageview';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import * as pageLayout from '@/scss/page-layout.module.scss';

import BasicUserInfoSection from './components/BasicUserInfoSection';
import CardContent from './components/CardContent';
import LinkAccountSection from './components/LinkAccountSection';
import NotSet from './components/NotSet';
import Skeleton from './components/Skeleton';
import DeleteAccountModal from './containers/DeleteAccountModal';
import * as styles from './index.module.scss';

function Profile() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const childrenRoutes = useRoutes(profile);
  usePlausiblePageview(profile);

  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const fetcher = useSwrFetcher<ConnectorResponse[]>(api);
  const { data: connectors, error: fetchConnectorsError } = useSWRImmutable<
    ConnectorResponse[],
    RequestError
  >('me/social/connectors', fetcher);
  const isLoadingConnectors = !connectors && !fetchConnectorsError;
  const { user, reload, isLoading: isLoadingUser } = useCurrentUser();
  const { isLoading: isUserAssetServiceLoading } = useUserAssetsService();
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const showLoadingSkeleton = isLoadingUser || isLoadingConnectors || isUserAssetServiceLoading;

  return (
    <div className={styles.pageContainer}>
      <Topbar hideTenantSelector hideTitle />
      <OverlayScrollbar className={styles.scrollable}>
        <div className={styles.wrapper}>
          <PageMeta titleKey="profile.page_title" />
          <div className={pageLayout.headline}>
            <CardTitle title="profile.title" subtitle="profile.description" />
          </div>
          {showLoadingSkeleton && <Skeleton />}
          {user && !showLoadingSkeleton && (
            <div className={styles.content}>
              <BasicUserInfoSection user={user} onUpdate={reload} />
              {isCloud && (
                <LinkAccountSection user={user} connectors={connectors} onUpdate={reload} />
              )}
              <FormCard title="profile.password.title">
                <CardContent
                  title="profile.password.password_setting"
                  data={[
                    {
                      key: 'password',
                      label: 'profile.password.password',
                      value: user.hasPassword,
                      renderer: (value) => (value ? <span>********</span> : <NotSet />),
                      action: {
                        name: 'profile.change',
                        handler: () => {
                          navigate(user.hasPassword ? 'verify-password' : 'change-password', {
                            state: { email: user.primaryEmail, action: 'changePassword' },
                          });
                        },
                      },
                    },
                  ]}
                />
              </FormCard>
              {isCloud && (
                <FormCard title="profile.delete_account.title">
                  <div className={styles.deleteAccount}>
                    <div className={styles.description}>
                      {t('profile.delete_account.description')}
                    </div>
                    <Button
                      title="profile.delete_account.button"
                      onClick={() => {
                        setShowDeleteAccountModal(true);
                      }}
                    />
                  </div>
                  <DeleteAccountModal
                    isOpen={showDeleteAccountModal}
                    onClose={() => {
                      setShowDeleteAccountModal(false);
                    }}
                  />
                </FormCard>
              )}
            </div>
          )}
        </div>
      </OverlayScrollbar>
      {childrenRoutes}
    </div>
  );
}

export default Profile;
