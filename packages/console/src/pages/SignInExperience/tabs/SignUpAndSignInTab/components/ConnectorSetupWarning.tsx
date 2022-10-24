import type { ConnectorResponse, SignUpIdentifier } from '@logto/schemas';
import { ConnectorType, SignInIdentifier } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { snakeCase } from 'snake-case';
import useSWR from 'swr';

import Alert from '@/components/Alert';
import type { RequestError } from '@/hooks/use-api';

import { signUpToSignInIdentifierMapping } from '../constants';

type Props = {
  signUpIdentifier?: SignUpIdentifier;
  signInIdentifiers?: SignInIdentifier[];
};

// TODO: @yijun add this util to essentials
const unreachableCaseGuardError = (guardedCase: never) => new Error(`Expect unreachable`);

const getNoConnectorI18nContext = (connectorTypes: ConnectorType[]) => {
  const { length } = connectorTypes;

  if (length === 1) {
    return connectorTypes[0]?.toLocaleLowerCase() ?? '';
  }

  if (
    length === 2 &&
    connectorTypes.includes(ConnectorType.Email) &&
    connectorTypes.includes(ConnectorType.Sms)
  ) {
    return [ConnectorType.Email, ConnectorType.Sms].join('_or_').toLocaleLowerCase();
  }

  return '';
};

const ConnectorSetupWarning = ({ signUpIdentifier, signInIdentifiers }: Props) => {
  const { data: connectors } = useSWR<ConnectorResponse[], RequestError>('/api/connectors');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const requiredSignInIdentifiers = useMemo(() => {
    if (signInIdentifiers) {
      return signInIdentifiers;
    }

    if (signUpIdentifier) {
      return signUpToSignInIdentifierMapping[signUpIdentifier];
    }

    return [];
  }, [signUpIdentifier, signInIdentifiers]);

  const connectorTypes = useMemo(() => {
    return requiredSignInIdentifiers.length === 0
      ? [ConnectorType.Social]
      : requiredSignInIdentifiers.reduce<ConnectorType[]>((previous, current) => {
          switch (current) {
            case SignInIdentifier.Username: {
              return previous;
            }

            case SignInIdentifier.Email: {
              return [...previous, ConnectorType.Email];
            }

            case SignInIdentifier.Phone: {
              return [...previous, ConnectorType.Sms];
            }

            default: {
              throw unreachableCaseGuardError(current);
            }
          }
        }, []);
  }, [requiredSignInIdentifiers]);

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
      {t('sign_in_exp.setup_warning.no_connector', {
        context: snakeCase(getNoConnectorI18nContext(connectorTypes)),
      })}
    </Alert>
  );
};

export default ConnectorSetupWarning;
