import type { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';

import SocialLinkButton from '@/components/Button/SocialLinkButton';
import useSocial from '@/hooks/use-social';
import { getLogoUrl } from '@/utils/logo';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  socialConnectors?: ConnectorMetadata[];
};

const SocialSignInList = ({ className, socialConnectors = [] }: Props) => {
  const { invokeSocialSignIn, theme } = useSocial();

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
