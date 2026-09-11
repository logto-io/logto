import { type SubjectProofConnector } from '@logto/schemas';
import { useMemo, useState } from 'react';

import SocialLinkButton from '@/components/Button/SocialLinkButton';
import useSocial from '@/containers/SocialSignInList/use-social';
import useConnectors from '@/hooks/use-connectors';
import useNativeMessageListener from '@/hooks/use-native-message-listener';
import { useSieMethods } from '@/hooks/use-sie';
import useSingleSignOn from '@/hooks/use-single-sign-on';

import styles from './index.module.scss';

type Props = {
  /** The linked connectors Core offers as subject proof, in the server's order. */
  readonly connectors: readonly SubjectProofConnector[];
};

/**
 * The social / enterprise SSO connectors a user with no verifiable method can re-run as subject
 * proof before establishing a method. Only the connectors Core lists are rendered, resolved by
 * the type Core states against the sign-in experience for their name and logo; an id the
 * experience does not enable is skipped. The buttons reuse the existing social / SSO redirects
 * and callback pages.
 */
const StepUpSubjectProofList = ({ connectors }: Props) => {
  const { socialConnectors, ssoConnectors } = useSieMethods();
  const { getConnectorLogo } = useConnectors();
  const { invokeSocialSignIn } = useSocial();
  const invokeSingleSignOn = useSingleSignOn();
  const [loadingConnectorId, setLoadingConnectorId] = useState<string>();
  useNativeMessageListener();

  const resolvedConnectors = useMemo(
    () =>
      connectors
        .map(({ type, connectorId }) => {
          if (type === 'sso') {
            const connector = ssoConnectors.find(({ id }) => id === connectorId);

            return connector && { type, connector };
          }

          const connector = socialConnectors.find(({ id }) => id === connectorId);

          return connector && { type, connector };
        })
        .filter(
          (resolved): resolved is Exclude<typeof resolved, undefined> => resolved !== undefined
        ),
    [connectors, socialConnectors, ssoConnectors]
  );

  return (
    <div className={styles.connectorList}>
      {resolvedConnectors.map((resolved) => {
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
