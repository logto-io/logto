import { type ConnectorResponse, type UserProfileResponse } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import ConnectorName from '@/components/ConnectorName';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import FormCard from '@/components/FormCard';
import UserAvatar from '@/components/UserAvatar';
import CodeEditor from '@/ds-components/CodeEditor';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import { type RequestError } from '@/hooks/use-api';
import { getUserSubtitle, getUserTitle } from '@/utils/user';

import DeleteSocialIdentityConfirmModal from './DeleteSocialIdentityConfirmModal';
import TokenStorage, { ConnectorType } from './TokenStorage';
import styles from './index.module.scss';
import useSocialIdentityData from './use-social-identity-data';

type PageTitleProps = {
  readonly user: UserProfileResponse;
  readonly connector?: ConnectorResponse;
};

function PageTitle({ user, connector }: PageTitleProps) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const userName = getUserTitle(user);

  const connectorName = connector?.name ?? t('connectors.unknown');

  return (
    <span>
      {userName} {'>'} <ConnectorName name={connectorName} />
    </span>
  );
}

function SocialIdentityDetails() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const { userId, target } = useParams();

  const navigate = useNavigate();

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
    mutate,
  } = useSWR<UserProfileResponse, RequestError>(userId && `api/users/${userId}`);

  const {
    isLoading: isSocialIdentityLoading,
    socialIdentityError,
    socialIdentityData,
    connector,
    mutateSocialIdentity,
  } = useSocialIdentityData({
    userId,
    target,
  });

  const { mutate: mutateGlobal } = useSWRConfig();

  const isLoading = isUserLoading || isSocialIdentityLoading;
  const error = userError ?? socialIdentityError;

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const userSocialIdentityString = useMemo(
    () => socialIdentityData && JSON.stringify(socialIdentityData.identity, null, 2),
    [socialIdentityData]
  );

  return (
    <DetailsPage
      backLink={`/users/${userId}`}
      backLinkTitle="user_details.page_title"
      isLoading={isLoading}
      error={error}
      onRetry={mutate}
    >
      {userData && socialIdentityData && (
        <DetailsPageHeader
          icon={<UserAvatar user={userData} size="xlarge" />}
          title={<PageTitle user={userData} connector={connector} />}
          subtitle={getUserSubtitle(userData)}
          identifier={{ name: 'Social identity ID', value: socialIdentityData.identity.userId }}
          actionMenuItems={[
            {
              title: 'user_identity_details.delete_identity',
              icon: <Delete />,
              onClick: () => {
                setShowDeleteConfirmModal(true);
              },
              type: 'danger',
            },
          ]}
        />
      )}

      <div className={styles.form}>
        {socialIdentityData && (
          <FormCard
            title="user_identity_details.social_account.title"
            description="user_identity_details.social_account.description"
            descriptionInterpolation={{
              connectorName: connector?.name.en ?? t('connectors.unknown'),
            }}
          >
            <FormField title="user_identity_details.social_account.provider_name">
              <CopyToClipboard
                displayType="block"
                variant="border"
                value={connector?.name.en ?? t('connectors.unknown')}
              />
            </FormField>
            <FormField title="user_identity_details.social_account.identity_id">
              <CopyToClipboard
                displayType="block"
                variant="border"
                value={socialIdentityData.identity.userId}
              />
            </FormField>
            <FormField title="user_identity_details.social_account.user_profile">
              <CodeEditor isReadonly language="json" value={userSocialIdentityString} />
            </FormField>
          </FormCard>
        )}
        <TokenStorage
          type={ConnectorType.Social}
          tokenSecret={socialIdentityData?.tokenSecret}
          connector={connector}
          mutate={mutateSocialIdentity}
        />
      </div>

      {target && userId && (
        <DeleteSocialIdentityConfirmModal
          userId={userId}
          isOpen={showDeleteConfirmModal}
          target={target}
          connectorName={<ConnectorName name={connector?.name ?? t('connectors.unknown')} />}
          onCancel={() => {
            setShowDeleteConfirmModal(false);
          }}
          onDeleteCallback={() => {
            setShowDeleteConfirmModal(false);
            // Mutate the user identities data to remove the deleted identity
            void mutateGlobal(`api/users/${userId}/all-identities`);
            navigate(-1);
          }}
        />
      )}
    </DetailsPage>
  );
}

export default SocialIdentityDetails;
