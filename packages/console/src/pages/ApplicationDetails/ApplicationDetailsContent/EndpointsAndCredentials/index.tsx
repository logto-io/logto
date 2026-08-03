import {
  type ApplicationApiResponse,
  type SnakeCaseOidcConfig,
  internalPrefix,
  hasSecrets,
} from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import FormCard from '@/components/FormCard';
import OidcEndpoints from '@/components/OidcEndpoints';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import { type RequestError } from '@/hooks/use-api';

import CreateSecretModal from '../CreateSecretModal';
import EditSecretModal from '../EditSecretModal';

import styles from './index.module.scss';
import { type ApplicationSecretRow, useSecretTableColumns } from './use-secret-table-columns';

export { type ApplicationSecretRow } from './use-secret-table-columns';

const isLegacySecret = (secret?: string): secret is string =>
  Boolean(secret && !secret.startsWith(internalPrefix));

type Props = {
  readonly app: ApplicationApiResponse;
  readonly oidcConfig: SnakeCaseOidcConfig;
  readonly onApplicationUpdated: () => void;
};

function EndpointsAndCredentials({
  app: { type, secret, id, isThirdParty },
  oidcConfig,
  onApplicationUpdated,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [showCreateSecretModal, setShowCreateSecretModal] = useState(false);
  const [editSecret, setEditSecret] = useState<ApplicationSecretRow>();
  const secrets = useSWR<ApplicationSecretRow[], RequestError>(`api/applications/${id}/secrets`);
  const shouldShowAppSecrets = hasSecrets(type);

  const secretsData = useMemo(
    () => [
      ...(isLegacySecret(secret)
        ? [
            {
              name: t('application_details.secrets.legacy_secret'),
              value: secret,
              expiresAt: null,
              isLegacy: true,
            },
          ]
        : []),
      ...(secrets.data ?? []),
    ],
    [secret, secrets.data, t]
  );

  const onUpdated = useCallback(
    (isLegacy: boolean) => {
      if (isLegacy) {
        onApplicationUpdated();
      } else {
        void secrets.mutate();
      }
    },
    [onApplicationUpdated, secrets]
  );
  const onEditSecret = useCallback((secret: ApplicationSecretRow) => {
    setEditSecret(secret);
  }, []);
  const tableColumns = useSecretTableColumns({
    appId: id,
    onUpdated,
    onEdit: onEditSecret,
  });
  return (
    <FormCard
      title="application_details.endpoints_and_credentials"
      description="application_details.endpoints_and_credentials_description"
      learnMoreLink={{
        href: 'https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint',
        targetBlank: true,
      }}
    >
      <OidcEndpoints oidcConfig={oidcConfig} hasLogtoEndpoint={!isThirdParty} />
      <FormField title="application_details.application_id">
        <CopyToClipboard displayType="block" value={id} variant="border" />
      </FormField>
      {shouldShowAppSecrets && (
        <FormField title="application_details.application_secret_other">
          {secretsData.length === 0 && !secrets.error ? (
            <>
              <div className={styles.empty}>{t('application_details.secrets.empty')}</div>
              <Button
                icon={<Plus />}
                title="application_details.secrets.create_new_secret"
                onClick={() => {
                  setShowCreateSecretModal(true);
                }}
              />
            </>
          ) : (
            <>
              <Table
                hasBorder
                isRowHoverEffectDisabled
                rowIndexKey="name"
                isLoading={!secrets.data && !secrets.error}
                errorMessage={secrets.error?.body?.message ?? secrets.error?.message}
                rowGroups={[{ key: 'application_secrets', data: secretsData }]}
                columns={tableColumns}
                className={styles.table}
              />
              <Button
                size="small"
                type="text"
                className={styles.add}
                title="application_details.secrets.create_new_secret"
                icon={<CirclePlus />}
                onClick={() => {
                  setShowCreateSecretModal(true);
                }}
              />
            </>
          )}
          <CreateSecretModal
            appId={id}
            isOpen={showCreateSecretModal}
            onClose={(created) => {
              if (created) {
                void secrets.mutate();
              }
              setShowCreateSecretModal(false);
            }}
          />
          {editSecret && (
            <EditSecretModal
              isOpen
              appId={id}
              secret={editSecret}
              onClose={(updated) => {
                if (updated) {
                  void secrets.mutate();
                }
                setEditSecret(undefined);
              }}
            />
          )}
        </FormField>
      )}
    </FormCard>
  );
}

export default EndpointsAndCredentials;
