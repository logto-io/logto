import type { ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Alert from '@/components/Alert';
import type { RequestError } from '@/hooks/use-api';

type Props = {
  requiredConnectors: ConnectorType[];
};

const ConnectorSetupWarning = ({ requiredConnectors }: Props) => {
  const { data: connectors } = useSWR<ConnectorResponse[], RequestError>('/api/connectors');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (!connectors) {
    return null;
  }

  const missingConnectors = requiredConnectors.filter(
    (connectorType) => !connectors.some(({ type, enabled }) => type === connectorType && enabled)
  );

  if (missingConnectors.length === 0) {
    return null;
  }

  return (
    <>
      {missingConnectors.map((connectorType) => (
        <Alert
          key={connectorType}
          action="general.set_up"
          href={connectorType === ConnectorType.Social ? '/connectors/social' : '/connectors'}
        >
          {t('sign_in_exp.setup_warning.no_connector', {
            context: connectorType.toLowerCase(),
          })}
        </Alert>
      ))}
    </>
  );
};

export default ConnectorSetupWarning;
