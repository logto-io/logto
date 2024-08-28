import { type AdminConsoleKey } from '@logto/phrases';
import { ConnectorType } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';

import * as styles from './index.module.scss';

type NoConnectorWarningPhrase = {
  [key in ConnectorType]: AdminConsoleKey;
};

const noConnectorWarningPhrase = Object.freeze({
  [ConnectorType.Email]: 'sign_in_exp.setup_warning.no_connector_email',
  [ConnectorType.Sms]: 'sign_in_exp.setup_warning.no_connector_sms',
  [ConnectorType.Social]: 'sign_in_exp.setup_warning.no_connector_social',
}) satisfies NoConnectorWarningPhrase;

type Props = {
  readonly requiredConnectors: ConnectorType[];
};

function ConnectorSetupWarning({ requiredConnectors }: Props) {
  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const missingConnectors = requiredConnectors.filter(
    (connectorType) => !isConnectorTypeEnabled(connectorType)
  );

  if (missingConnectors.length === 0) {
    return null;
  }

  return (
    <>
      {missingConnectors.map((connectorType) => (
        <InlineNotification key={connectorType} className={styles.notice}>
          <Trans
            components={{
              a: (
                <TextLink
                  to={connectorType === ConnectorType.Social ? '/connectors/social' : '/connectors'}
                />
              ),
            }}
          >
            {t(noConnectorWarningPhrase[connectorType], {
              link: t('sign_in_exp.setup_warning.setup_link'),
            })}
          </Trans>
        </InlineNotification>
      ))}
    </>
  );
}

export default ConnectorSetupWarning;
