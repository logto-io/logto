import { type UserProfileResponse } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import FormCard from '@/components/FormCard';
import UserAvatar from '@/components/UserAvatar';
import CodeEditor from '@/ds-components/CodeEditor';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import { type RequestError } from '@/hooks/use-api';
import { getUserSubtitle, getUserTitle } from '@/utils/user';

import TokenStorage, { ConnectorType } from './TokenStorage';
import styles from './index.module.scss';
import useSsoIdentityData from './use-sso-identity-data';

function SsoIdentityDetails() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const { userId, connectorId } = useParams();

  const navigate = useNavigate();

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
    mutate,
  } = useSWR<UserProfileResponse, RequestError>(userId && `api/users/${userId}`);

  const {
    isLoading: isSsoIdentityLoading,
    ssoIdentityData,
    ssoIdentityError,
    ssoConnector,
    mutateSsoIdentity,
  } = useSsoIdentityData({
    userId,
    connectorId,
  });

  const { mutate: mutateGlobal } = useSWRConfig();

  const isLoading = isUserLoading || isSsoIdentityLoading;
  const error = userError ?? ssoIdentityError;

  const userSsoIdentityString = useMemo(
    () => ssoIdentityData && JSON.stringify(ssoIdentityData.ssoIdentity, null, 2),
    [ssoIdentityData]
  );

  return (
    <DetailsPage
      backLink={`/users/${userId}`}
      backLinkTitle="user_details.page_title"
      isLoading={isLoading}
      error={error}
      onRetry={mutate}
    >
      {userData && ssoIdentityData && (
        <DetailsPageHeader
          icon={<UserAvatar user={userData} size="xlarge" />}
          title={
            <span>
              {getUserTitle(userData)} {'>'} {ssoConnector?.name}
            </span>
          }
          subtitle={getUserSubtitle(userData)}
          identifier={{
            name: 'Enterprise SSO identity ID',
            value: ssoIdentityData.ssoIdentity.identityId,
          }}
        />
      )}

      <div className={styles.form}>
        {ssoIdentityData && ssoConnector && (
          <FormCard
            title="user_identity_details.sso_account.title"
            description="user_identity_details.sso_account.description"
            descriptionInterpolation={{
              connectorName: ssoConnector.name,
            }}
          >
            <FormField title="user_identity_details.sso_account.provider_name">
              <CopyToClipboard displayType="block" variant="border" value={ssoConnector.name} />
            </FormField>
            <FormField title="user_identity_details.sso_account.identity_id">
              <CopyToClipboard
                displayType="block"
                variant="border"
                value={ssoIdentityData.ssoIdentity.identityId}
              />
            </FormField>
            <FormField title="user_identity_details.sso_account.user_profile">
              <CodeEditor isReadonly language="json" value={userSsoIdentityString} />
            </FormField>
          </FormCard>
        )}
        <TokenStorage
          type={ConnectorType.EnterpriseSso}
          tokenSecret={ssoIdentityData?.tokenSecret}
          connector={ssoConnector}
          mutate={mutateSsoIdentity}
        />
      </div>
    </DetailsPage>
  );
}

export default SsoIdentityDetails;
