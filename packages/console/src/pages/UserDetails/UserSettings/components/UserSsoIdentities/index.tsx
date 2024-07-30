import {
  ssoBrandingGuard,
  type SsoConnectorWithProviderConfig,
  type UserSsoIdentity,
} from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { z } from 'zod';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import Table from '@/ds-components/Table';
import type { RequestError } from '@/hooks/use-api';
import SsoConnectorLogo from '@/pages/EnterpriseSso/SsoConnectorLogo';

import styles from '../UserSocialIdentities/index.module.scss';

type Props = {
  readonly ssoIdentities: UserSsoIdentity[];
};

type DisplayConnector = {
  providerLogo: SsoConnectorWithProviderConfig['providerLogo'];
  providerLogoDark: SsoConnectorWithProviderConfig['providerLogoDark'];
  branding: SsoConnectorWithProviderConfig['branding'];
  name: SsoConnectorWithProviderConfig['connectorName'];
  userIdentity: UserSsoIdentity['identityId'];
  issuer: UserSsoIdentity['issuer'];
};

const isIdentityDisplayConnector = (
  identity: Partial<DisplayConnector>
): identity is DisplayConnector => {
  // `DisplayConnector` instance should have `providerLogo`, `providerLogoDark` and `name` to be non-empty string and `branding` to be an object.
  const identityGuard = z.object({
    providerLogo: z.string().min(1),
    providerLogoDark: z.string().min(1),
    branding: ssoBrandingGuard,
    name: z.string().min(1),
  });
  const result = identityGuard.safeParse(identity);
  return result.success;
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

    return ssoIdentities
      .map((identity) => {
        const {
          providerLogo,
          providerLogoDark,
          branding,
          connectorName: name,
        } = data.find((ssoConnector) => ssoConnector.id === identity.ssoConnectorId) ?? {};
        const { identityId: userIdentity, issuer } = identity;

        return { providerLogo, providerLogoDark, branding, name, userIdentity, issuer };
      })
      .filter((identity): identity is DisplayConnector => isIdentityDisplayConnector(identity));
  }, [data, ssoIdentities]);

  const hasLinkedSsoIdentities = Boolean(displaySsoConnectors && displaySsoConnectors.length > 0);

  return (
    <div>
      {!isLoading && !error && (
        <div className={styles.description}>
          {t(
            hasLinkedSsoIdentities
              ? 'user_details.sso_connectors.connected'
              : 'user_details.sso_connectors.not_connected'
          )}
        </div>
      )}
      {(isLoading || hasLinkedSsoIdentities || error) && (
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
              render: ({ providerLogo, providerLogoDark, branding, name }) => (
                <div className={styles.connectorName}>
                  <SsoConnectorLogo
                    containerClassName={styles.icon}
                    data={{ providerLogo, providerLogoDark, branding }}
                  />
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
