import type { ConnectorResponse } from '@logto/schemas';
import { ConnectorType, SignUpIdentifier } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { snakeCase } from 'snake-case';
import useSWR from 'swr';

import Alert from '@/components/Alert';
import type { RequestError } from '@/hooks/use-api';

type Props = {
  signUpIdentifier: SignUpIdentifier;
};

const ConnectorSetupWarning = ({ signUpIdentifier }: Props) => {
  const { data: connectors } = useSWR<ConnectorResponse[], RequestError>('/api/connectors');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const connectorTypes = useMemo(() => {
    if (signUpIdentifier === SignUpIdentifier.Username) {
      return [];
    }

    if (signUpIdentifier === SignUpIdentifier.Email) {
      return [ConnectorType.Email];
    }

    if (signUpIdentifier === SignUpIdentifier.Phone) {
      return [ConnectorType.Sms];
    }

    if (signUpIdentifier === SignUpIdentifier.EmailOrPhone) {
      return [ConnectorType.Email, ConnectorType.Sms];
    }

    return [ConnectorType.Social];
  }, [signUpIdentifier]);

  if (connectorTypes.length === 0 || !connectors) {
    return null;
  }

  if (
    connectorTypes.every((connectorType) =>
      connectors.some(({ type, enabled }) => type === connectorType && enabled)
    )
  ) {
    return null;
  }

  return (
    <Alert
      action="general.set_up"
      href={connectorTypes.includes(ConnectorType.Social) ? '/connectors/social' : '/connectors'}
    >
      {t('sign_in_exp.setup_warning.no_connector', { context: snakeCase(signUpIdentifier) })}
    </Alert>
  );
};

export default ConnectorSetupWarning;
