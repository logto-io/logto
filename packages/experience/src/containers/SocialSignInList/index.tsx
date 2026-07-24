import type { ExperienceSocialConnector } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';

import SocialLinkButton from '@/components/Button/SocialLinkButton';
import useNativeMessageListener from '@/hooks/use-native-message-listener';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { getLogoUrl } from '@/shared/utils/logo';
/* TE:BEGIN qr-push-factor */
import { TeWalletMode, getTeWalletMode, teRoutes } from '@/te/config';
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
  const navigate = useNavigateWithPreservedSearchParams();

  // Push needs to know who is signing in, so it lives in the verification-methods list
  // instead of here. QR is identifier-less and stays on the first screen.
  const visibleConnectors = socialConnectors.filter(
    ({ target }) => getTeWalletMode(target) !== TeWalletMode.Push
  );
  /* TE:END qr-push-factor */

  const handleClick = async (connector: ExperienceSocialConnector) => {
    /* TE:BEGIN qr-push-factor */
    // The QR factor gets its own screen, the same way passkey does.
    if (getTeWalletMode(connector.target) === TeWalletMode.Qr) {
      navigate(teRoutes.qr);
      return;
    }
    /* TE:END qr-push-factor */

    setLoadingConnectorId(connector.id);
    await invokeSocialSignIn(connector);
    setLoadingConnectorId(undefined);
  };

  return (
    <div className={classNames(styles.socialLinkList, className)}>
      {/* TE:BEGIN qr-push-factor — was `socialConnectors.map` */}
      {visibleConnectors.map((connector) => {
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
      {/* TE:END qr-push-factor */}
    </div>
  );
};

export default SocialSignInList;
