import type { ExperienceSocialConnector } from '@logto/schemas';
import classNames from 'classnames';

import SocialLinkButton from '@/components/Button/SocialLinkButton';
import useNativeMessageListener from '@/hooks/use-native-message-listener';
import { getLogoUrl } from '@/utils/logo';

import * as styles from './index.module.scss';
import useSocial from './use-social';

type Props = {
  readonly className?: string;
  readonly socialConnectors?: ExperienceSocialConnector[];
};

const SocialSignInList = ({ className, socialConnectors = [] }: Props) => {
  const { invokeSocialSignIn, theme } = useSocial();
  useNativeMessageListener();

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
            onClick={() => {
              void invokeSocialSignIn(connector);
            }}
          />
        );
      })}
    </div>
  );
};

export default SocialSignInList;
