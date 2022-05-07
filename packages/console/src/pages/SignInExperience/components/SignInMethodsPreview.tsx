import { ConnectorDTO, SignInExperience, SignInMethodKey, SignInMethodState } from '@logto/schemas';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import UnnamedTrans from '@/components/UnnamedTrans';
import { RequestError } from '@/hooks/use-api';

import * as styles from './SaveAlert.module.scss';

type Props = {
  data: SignInExperience;
};

const SignInMethodsPreview = ({ data }: Props) => {
  const { data: connectors, error } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const { signInMethods, socialSignInConnectorIds } = data;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const connectorNames = useMemo(() => {
    if (!connectors) {
      return null;
    }

    return socialSignInConnectorIds.map((connectorId) => {
      const connector = connectors.find(({ id }) => id === connectorId);

      if (!connector) {
        return null;
      }

      return (
        <UnnamedTrans
          key={connectorId}
          className={styles.connector}
          resource={connector.metadata.name}
        />
      );
    });
  }, [connectors, socialSignInConnectorIds]);

  return (
    <div>
      {!connectors && !error && <div>loading</div>}
      {error && <div>{error.body.message}</div>}
      {connectors &&
        Object.values(SignInMethodKey)
          .filter((key) => signInMethods[key] !== SignInMethodState.Disabled)
          .map((key) => (
            <div key={key}>
              {t('sign_in_exp.sign_in_methods.methods', { context: key })}
              {key === SignInMethodKey.Social && <span>: {connectorNames}</span>}
            </div>
          ))}
    </div>
  );
};

export default SignInMethodsPreview;
