import { ConnectorDTO, ConnectorType, SignInMethodKey } from '@logto/schemas';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Alert from '@/components/Alert';
import { RequestError } from '@/hooks/use-api';

type Props = {
  method: SignInMethodKey;
};

const ConnectorSetupWarning = ({ method }: Props) => {
  const { data: connectors } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const type = useMemo(() => {
    if (method === SignInMethodKey.Username) {
      return;
    }

    if (method === SignInMethodKey.SMS) {
      return ConnectorType.SMS;
    }

    if (method === SignInMethodKey.Email) {
      return ConnectorType.Email;
    }

    return ConnectorType.Social;
  }, [method]);

  if (!type || !connectors) {
    return null;
  }

  if (connectors.some(({ metadata, enabled }) => metadata.type === type && enabled)) {
    return null;
  }

  return (
    <Alert
      action="admin_console.sign_in_exp.setup_warning.setup"
      href={type === ConnectorType.Social ? '/connectors/social' : '/connectors'}
    >
      {t('sign_in_exp.setup_warning.no_connector', { context: type.toLowerCase() })}
    </Alert>
  );
};

export default ConnectorSetupWarning;
