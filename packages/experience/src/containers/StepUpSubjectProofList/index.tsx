import { useState } from 'react';

import SocialLinkButton from '@/components/Button/SocialLinkButton';
import useSocial from '@/containers/SocialSignInList/use-social';
import useConnectors, { type ResolvedSubjectProofConnector } from '@/hooks/use-connectors';
import useNativeMessageListener from '@/hooks/use-native-message-listener';
import useSingleSignOn from '@/hooks/use-single-sign-on';

import styles from './index.module.scss';

type Props = {
  /** The resolved connectors Core offers as subject proof, in the server's order. */
  readonly connectors: readonly ResolvedSubjectProofConnector[];
};

/**
 * The social / enterprise SSO connectors a user with no verifiable method can re-run as subject
 * proof before establishing a method. The buttons reuse the existing social / SSO redirects
 * and callback pages.
 */
const StepUpSubjectProofList = ({ connectors }: Props) => {
  const { getConnectorLogo } = useConnectors();
  const { invokeSocialSignIn } = useSocial();
  const invokeSingleSignOn = useSingleSignOn();
  const [loadingConnectorId, setLoadingConnectorId] = useState<string>();
  useNativeMessageListener();

  return (
    <div className={styles.connectorList}>
      {connectors.map((resolved) => {
        const { connector, type } = resolved;
        const { id } = connector;

        return (
          <SocialLinkButton
            key={id}
            // I18n support for the SSO connector name is not supported yet, always display the plain text
            name={type === 'social' ? connector.name : { en: connector.connectorName }}
            target={type === 'social' ? connector.target : connector.connectorName}
            logo={getConnectorLogo(resolved)}
            isLoading={loadingConnectorId === id}
            onClick={async () => {
              setLoadingConnectorId(id);
              await (type === 'social' ? invokeSocialSignIn(connector) : invokeSingleSignOn(id));
              setLoadingConnectorId(undefined);
            }}
          />
        );
      })}
    </div>
  );
};

export default StepUpSubjectProofList;
