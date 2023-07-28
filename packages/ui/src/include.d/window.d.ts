import { type Eip1193Provider } from 'ethers';

declare interface Window {
  ethereum: Eip1193Provider;
}
