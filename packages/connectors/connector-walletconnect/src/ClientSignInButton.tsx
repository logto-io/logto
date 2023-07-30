import './polyfill';

import { type BlockchainConnectorSignInButtonProperties } from '@logto/connector-kit';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Button, Web3Modal, useWeb3Modal } from '@web3modal/react';
import { useEffect, useState } from 'react';
import {
  configureChains,
  createConfig,
  useAccount,
  WagmiConfig,
  useSignMessage as useWagmiSign,
} from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';

const chains = [mainnet, polygon];
const projectId = '9a65da3a1c5919596eba0d7420ff140d';
// TODO: @lbennett move setup to effect
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

const SignInButton = ({
  children: Children,
  onSigned,
  ...properties
}: BlockchainConnectorSignInButtonProperties) => {
  const { data: signature, signMessage: wagmiSign, error, status: signStatus } = useWagmiSign();
  const { address, status } = useAccount();
  const { open, close } = useWeb3Modal();
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    if (!hasClicked || !address || status !== 'connected') {
      return;
    }

    // TODO: @lbennett replace with nonce
    wagmiSign({ message: 'wow' });
    setHasClicked(false);

    close();
  }, [address, status, hasClicked]);

  useEffect(() => {
    if (!address || !signature || status !== 'connected') {
      return;
    }

    onSigned({ address, signature });
  }, [address, signature, status, hasClicked, signStatus]);

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ paddingRight: status === 'connected' ? '16px' : '0px', width: '100%' }}>
        <Children
          onClick={() => {
            setHasClicked(true);

            if (status !== 'connected') {
              open();
            }
          }}
        />
      </div>
      {status === 'connected' && <Web3Button />}
    </div>
  );
};

const ClientSignInButton = ({
  children,
  ...properties
}: BlockchainConnectorSignInButtonProperties) => {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <SignInButton {...properties}>{children}</SignInButton>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
};

export default ClientSignInButton;
