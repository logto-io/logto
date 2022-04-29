import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Alert from '@/components/Alert';
import { RequestError } from '@/hooks/use-api';

type Props = {
  type: ConnectorType;
};

const ConnectorSetupWarning = ({ type }: Props) => {
  const { data: connectors } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (
    connectors &&
    !connectors.some(({ metadata, enabled }) => metadata.type === type && enabled)
  ) {
    return (
      <Alert
        action="admin_console.sign_in_exp.setup_warning.setup"
        href={type === ConnectorType.Social ? '/connectors/social' : '/connectors'}
      >
        {t('sign_in_exp.setup_warning.no_connector', { context: type.toLowerCase() })}
      </Alert>
    );
  }

  return null;
};

export default ConnectorSetupWarning;
