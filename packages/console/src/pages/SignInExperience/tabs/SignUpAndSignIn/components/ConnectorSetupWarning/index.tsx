import { ConnectorType } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import InlineNotification from '@/components/InlineNotification';
import TextLink from '@/components/TextLink';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';
import { noConnectorWarningPhrase } from '@/pages/SignInExperience/constants';

import * as styles from './index.module.scss';

type Props = {
  requiredConnectors: ConnectorType[];
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
