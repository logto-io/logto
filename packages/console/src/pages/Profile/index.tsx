import type { ConnectorResponse } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWRImmutable from 'swr/immutable';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import FormCard from '@/components/FormCard';
import { adminTenantEndpoint, meApi } from '@/consts';
import { isCloud } from '@/consts/cloud';
import type { RequestError } from '@/hooks/use-api';
import { useStaticApi } from '@/hooks/use-api';
import useCurrentUser from '@/hooks/use-current-user';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import * as resourcesStyles from '@/scss/resources.module.scss';
import { withAppInsights } from '@/utils/app-insights';

import BasicUserInfoSection from './components/BasicUserInfoSection';
import CardContent from './components/CardContent';
import LinkAccountSection from './components/LinkAccountSection';
import NotSet from './components/NotSet';
import Skeleton from './components/Skeleton';
import DeleteAccountModal from './containers/DeleteAccountModal';
import * as styles from './index.module.scss';

function Profile() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
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
    <div className={resourcesStyles.container}>
      <div className={resourcesStyles.headline}>
        <CardTitle title="profile.title" subtitle="profile.description" />
      </div>
      {showLoadingSkeleton && <Skeleton />}
      {user && !showLoadingSkeleton && (
        <div className={styles.content}>
          <BasicUserInfoSection user={user} onUpdate={reload} />
          <LinkAccountSection user={user} connectors={connectors} onUpdate={reload} />
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
                <div className={styles.description}>{t('profile.delete_account.description')}</div>
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
  );
}

export default withAppInsights(Profile);
