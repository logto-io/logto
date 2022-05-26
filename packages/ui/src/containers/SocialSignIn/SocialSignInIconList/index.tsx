import classNames from 'classnames';
import React from 'react';

import MoreSocialIcon from '@/assets/icons/more-social-icon.svg';
import IconButton from '@/components/Button/IconButton';
import SocialIconButton from '@/components/Button/SocialIconButton';
import useSocial from '@/hooks/use-social';
import { ConnectorData } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectors?: ConnectorData[];
  hasMore?: boolean;
  moreButtonRef: React.RefObject<HTMLButtonElement>;
  onMoreButtonClick?: () => void;
};

const SocialSignInIconList = ({
  className,
  connectors = [],
  hasMore = false,
  moreButtonRef,
  onMoreButtonClick,
}: Props) => {
  const { invokeSocialSignIn } = useSocial();

  return (
    <div className={classNames(styles.socialIconList, className)}>
      {connectors.map((connector) => (
        <SocialIconButton
          key={connector.id}
          className={styles.socialButton}
          connector={connector}
          onClick={() => {
            void invokeSocialSignIn(connector.id);
          }}
        />
      ))}
      {hasMore && (
        <IconButton ref={moreButtonRef} className={styles.moreButton} onClick={onMoreButtonClick}>
          <MoreSocialIcon />
        </IconButton>
      )}
    </div>
  );
};

export default SocialSignInIconList;
