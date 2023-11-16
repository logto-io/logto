import type { SsoConnectorWithProviderConfig, UserSsoIdentity } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';
import Table from '@/ds-components/Table';
import type { RequestError } from '@/hooks/use-api';

import * as styles from '../UserSocialIdentities/index.module.scss';

type Props = {
  ssoIdentities: UserSsoIdentity[];
};

type DisplayConnector = {
  logo: SsoConnectorWithProviderConfig['providerLogo'];
  name: SsoConnectorWithProviderConfig['connectorName'];
  userIdentity: UserSsoIdentity['identityId'];
  issuer: UserSsoIdentity['issuer'];
};

function UserSsoIdentities({ ssoIdentities }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const { data, error, mutate } = useSWR<SsoConnectorWithProviderConfig[], RequestError>(
    'api/sso-connectors'
  );

  const isLoading = !data && !error;

  const displaySsoConnectors = useMemo(() => {
    if (!data) {
      return;
    }

    return (
      ssoIdentities
        .map((identity) => {
          const { providerLogo: logo, connectorName: name } =
            data.find((ssoConnector) => ssoConnector.id === identity.ssoConnectorId) ?? {};
          const { identityId: userIdentity, issuer } = identity;

          if (!(logo && name)) {
            return;
          }

          return { logo, name, userIdentity, issuer };
        })
        // eslint-disable-next-line unicorn/prefer-native-coercion-functions
        .filter((identity): identity is DisplayConnector => Boolean(identity))
    );
  }, [data, ssoIdentities]);

  const hasLinkedSsoIdentities = displaySsoConnectors && displaySsoConnectors.length > 0;

  return (
    <div>
      <div className={styles.description}>
        {t(
          hasLinkedSsoIdentities
            ? 'user_details.sso_connectors.connected'
            : 'user_details.sso_connectors.not_connected'
        )}
      </div>
      {hasLinkedSsoIdentities && (
        <Table
          hasBorder
          rowGroups={[{ key: 'ssoIdentity', data: displaySsoConnectors }]}
          rowIndexKey="issuer"
          isLoading={isLoading}
          errorMessage={error?.body?.message ?? error?.message}
          columns={[
            {
              title: t('user_details.sso_connectors.connectors'),
              dataIndex: 'name',
              colSpan: 5,
              render: ({ logo, name }) => (
                <div className={styles.connectorName}>
                  <ImageWithErrorFallback className={styles.icon} src={logo} alt="logo" />
                  <div className={styles.name}>
                    <span>{name}</span>
                  </div>
                </div>
              ),
            },
            {
              title: t('user_details.sso_connectors.enterprise_id'),
              dataIndex: 'userIdentity',
              colSpan: 8,
              render: ({ userIdentity }) => (
                <div className={styles.userId}>
                  <span>{userIdentity || '-'}</span>
                  {userIdentity && <CopyToClipboard variant="icon" value={userIdentity} />}
                </div>
              ),
            },
            {
              title: null,
              dataIndex: 'action',
              colSpan: 3,
              // Align with the social identities column span, leave the deletion action blank since SSO identities is not deletable in this user details page.
              render: () => <div />,
            },
          ]}
          onRetry={async () => mutate(undefined, true)}
        />
      )}
    </div>
  );
}

export default UserSsoIdentities;
