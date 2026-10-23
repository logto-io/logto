import { useContext } from 'react';

import { WalletModalContext } from '.';

const useWalletModal = () => useContext(WalletModalContext);

export default useWalletModal;
