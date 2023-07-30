import { ConnectorType } from '@logto/connector-kit';
import { type ConnectorMetadata } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { type FC } from 'react';

import ConnectorLinkButton from '@/components/Button/ConnectorLinkButton';
import { useBlockchain } from '@/hooks/use-blockchain';
import useNativeMessageListener from '@/hooks/use-native-message-listener';
import useSocial from '@/hooks/use-social';
import { getLogoUrl } from '@/utils/logo';

import * as styles from './index.module.scss';

// TODO: @lbenett share with core
export type ConnectorMetadataWithId = ConnectorMetadata & { id: string; type: ConnectorType };

type ListProps = {
  className?: string;
  connectors?: ConnectorMetadataWithId[];
};

type ItemProps = {
  connector: ConnectorMetadataWithId;
};

const SocialSignInListItem = ({ connector, ...props }: ItemProps) => {
  const { name, logo: logoUrl, logoDark: darkLogoUrl, target, id } = connector;
  const { invokeSocialSignIn, theme } = useSocial();

  return (
    <ConnectorLinkButton
      className={styles.connectorLinkButton}
      name={name}
      logo={getLogoUrl({ theme, logoUrl, darkLogoUrl })}
      target={target}
      onClick={() => {
        void invokeSocialSignIn(connector);
      }}
      {...props}
    />
  );
};

const BlockchainSignInListItem = ({ connector }: ItemProps) => {
  const { name, logo: logoUrl, logoDark: darkLogoUrl, target, id } = connector;
  const { ClientSignInButton, theme, invokeBlockchainSignIn } = useBlockchain(id);

  return (
    <ClientSignInButton
      onSigned={(payload) => {
        invokeBlockchainSignIn(connector, payload);
      }}
    >
      {(props) => {
        return (
          <ConnectorLinkButton
            className={styles.connectorLinkButton}
            name={name}
            logo={getLogoUrl({ theme, logoUrl, darkLogoUrl })}
            target={target}
            {...props}
          />
        );
      }}
    </ClientSignInButton>
  );
};

const buttonTypeMap: Record<ConnectorType, FC<ItemProps> | undefined> = {
  [ConnectorType.Blockchain]: BlockchainSignInListItem,
  [ConnectorType.Social]: SocialSignInListItem,
  [ConnectorType.Email]: undefined,
  [ConnectorType.Sms]: undefined,
};

const isConnectorType = (value: string): value is ConnectorType =>
  Object.values<string>(ConnectorType).includes(value);

export const parseToConnectorType = (value?: string): ConnectorType | undefined =>
  conditional(value && isConnectorType(value) && value);

const SignInListItem = ({ connector }: ItemProps) => {
  const type = parseToConnectorType(connector.type) ?? ConnectorType.Social;
  const ConnectorListItem: FC<ItemProps> = buttonTypeMap[type] ?? SocialSignInListItem;

  return <ConnectorListItem connector={connector} />;
};

const ConnectorSignInList = ({ className, connectors = [] }: ListProps) => {
  // TODO: @lbennett move to connector item, then only register if native connector is available
  // only listen once though!
  useNativeMessageListener();

  return (
    <div className={classNames(styles.connectorLinkList, className)}>
      {connectors.map((connector) => {
        return <SignInListItem key={connector.id} connector={connector} />;
      })}
    </div>
  );
};

export default ConnectorSignInList;
