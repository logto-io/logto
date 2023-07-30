import { type SignMessage } from '@logto/connector-kit';
import { BrowserProvider } from 'ethers';

// eslint-disable-next-line no-restricted-syntax, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
const provider = new BrowserProvider((window as any).ethereum);

export const signMessage: SignMessage = async (nonce) => {
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  const signature = await signer.signMessage(nonce);

  return { address, signature };
};
