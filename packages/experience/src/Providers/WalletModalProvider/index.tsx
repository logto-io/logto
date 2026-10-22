import type { ReactNode } from 'react';
import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/shared/components/Button';
import type { WalletOption } from '@/utils/wallet/evm';

import modalStyles from '../../scss/modal.module.scss';

import styles from './index.module.scss';

type WalletModalContextType = {
  show: (wallets: WalletOption[]) => Promise<WalletOption | undefined>;
};

export const WalletModalContext = createContext<WalletModalContextType>({
  show: async () => {
    throw new Error('WalletModalProvider is not mounted');
  },
});

type Props = {
  readonly children?: ReactNode;
};

const iconPrefixes = ['data:image/', 'https://'];

const isSafeIcon = (icon?: string) => iconPrefixes.some((prefix) => icon?.startsWith(prefix));

const WalletModalProvider = ({ children }: Props) => {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const resolverRef = useRef<(wallet?: WalletOption) => void>();

  const show = useCallback(async (options: WalletOption[]) => {
    resolverRef.current?.(undefined);
    setWallets(options);
    setIsOpen(true);

    return new Promise<WalletOption | undefined>((resolve) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- store the pending modal resolver
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((wallet?: WalletOption) => {
    resolverRef.current?.(wallet);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- clear the settled modal resolver
    resolverRef.current = undefined;
    setIsOpen(false);
  }, []);

  const contextValue = useMemo(() => ({ show }), [show]);

  return (
    <WalletModalContext.Provider value={contextValue}>
      {children}
      <ReactModal
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
        isOpen={isOpen}
        role="dialog"
        contentLabel={t('description.select_wallet')}
        className={styles.modal}
        overlayClassName={`${modalStyles.overlay} ${styles.overlay}`}
        onRequestClose={() => {
          close();
        }}
      >
        <div className={styles.container}>
          <div className={styles.title}>{t('description.select_wallet')}</div>
          <div className={styles.walletList}>
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                className={styles.wallet}
                onClick={() => {
                  close(wallet);
                }}
              >
                {isSafeIcon(wallet.icon) ? (
                  <img className={styles.icon} src={wallet.icon} alt="" />
                ) : (
                  <span aria-hidden className={styles.iconPlaceholder}>
                    {wallet.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className={styles.walletName}>{wallet.name}</span>
              </button>
            ))}
          </div>
          <Button
            className={styles.cancel}
            title="action.cancel"
            type="secondary"
            onClick={() => {
              close();
            }}
          />
        </div>
      </ReactModal>
    </WalletModalContext.Provider>
  );
};

export default WalletModalProvider;
