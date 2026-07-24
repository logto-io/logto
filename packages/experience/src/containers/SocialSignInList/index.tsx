import type { ExperienceSocialConnector } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';

import SocialLinkButton from '@/components/Button/SocialLinkButton';
import useNativeMessageListener from '@/hooks/use-native-message-listener';
import { getLogoUrl } from '@/shared/utils/logo';
/* TE:BEGIN qr-push-factor */
import TeWalletFactor from '@/te/TeWalletFactor';
import { getTeWalletMode, type TeWalletMode } from '@/te/config';
/* TE:END qr-push-factor */

import styles from './index.module.scss';
import useSocial from './use-social';

type Props = {
  readonly className?: string;
  readonly socialConnectors?: ExperienceSocialConnector[];
};

const SocialSignInList = ({ className, socialConnectors = [] }: Props) => {
  const { invokeSocialSignIn, theme } = useSocial();
  useNativeMessageListener();

  const [loadingConnectorId, setLoadingConnectorId] = useState<string>();

  /* TE:BEGIN qr-push-factor */
  const [walletFactor, setWalletFactor] = useState<{
    mode: TeWalletMode;
    name: Record<string, string>;
  }>();
  /* TE:END qr-push-factor */

  const handleClick = async (connector: ExperienceSocialConnector) => {
    /* TE:BEGIN qr-push-factor */
    // The wallet factors (QR / push) are resolved inline, so we never leave this page.
    const walletMode = getTeWalletMode(connector.target);

    if (walletMode) {
      setWalletFactor({ mode: walletMode, name: connector.name });
      return;
    }
    /* TE:END qr-push-factor */

    setLoadingConnectorId(connector.id);
    await invokeSocialSignIn(connector);
    setLoadingConnectorId(undefined);
  };

  return (
    <div className={classNames(styles.socialLinkList, className)}>
      {socialConnectors.map((connector) => {
        const { id, name, logo: logoUrl, logoDark: darkLogoUrl, target } = connector;

        return (
          <SocialLinkButton
            key={id}
            className={styles.socialLinkButton}
            name={name}
            logo={getLogoUrl({ theme, logoUrl, darkLogoUrl })}
            target={target}
            isLoading={loadingConnectorId === id}
            onClick={() => {
              void handleClick(connector);
            }}
          />
        );
      })}
      {/* TE:BEGIN qr-push-factor */}
      {walletFactor && (
        <TeWalletFactor
          mode={walletFactor.mode}
          connectorName={walletFactor.name}
          onClose={() => {
            setWalletFactor(undefined);
          }}
        />
      )}
      {/* TE:END qr-push-factor */}
    </div>
  );
};

export default SocialSignInList;
