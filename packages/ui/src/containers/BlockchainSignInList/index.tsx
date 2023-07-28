import type { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';

import BlockchainLinkButton from '@/components/Button/BlockchainLinkButton';
import useBlockchain from '@/hooks/use-blockchain';
import useNativeMessageListener from '@/hooks/use-native-message-listener';
import { getLogoUrl } from '@/utils/logo';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  blockchainConnectors?: ConnectorMetadata[];
};

const Item = ({ connector }: { connector: any }) => {
  const { name, logo: logoUrl, logoDark: darkLogoUrl, target, id } = connector;
  const { invokeBlockchainSignIn, theme } = useBlockchain(id);

  return (
    <BlockchainLinkButton
      className={styles.blockchainLinkButton}
      name={name}
      logo={getLogoUrl({ theme, logoUrl, darkLogoUrl })}
      target={target}
      onClick={() => {
        void invokeBlockchainSignIn(connector);
      }}
    />
  );
};

const BlockchainSignInList = ({ className, blockchainConnectors = [] }: Props) => {
  useNativeMessageListener();

  return (
    <div className={classNames(styles.blockchainLinkList, className)}>
      {blockchainConnectors.map((connector) => {
        return <Item key={connector.id} connector={connector} />;
      })}
    </div>
  );
};

export default BlockchainSignInList;
