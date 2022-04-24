import classNames from 'classnames';
import React, { useState, useMemo } from 'react';

import SocialLinkButton from '@/components/Button/SocialLinkButton';
import { ExpandMoreIcon } from '@/components/Icons';
import useSocial from '@/hooks/use-social';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  isPopup?: boolean;
  onSocialSignInCallback?: () => void;
};

const PrimarySocialSignIn = ({ className, isPopup = false, onSocialSignInCallback }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const { invokeSocialSignIn, socialConnectors } = useSocial({ onSocialSignInCallback });
  const isOverSize = socialConnectors.length > 3;
  const displayAll = showAll || isPopup || !isOverSize;

  const displayConnectors = useMemo(() => {
    if (displayAll) {
      return socialConnectors;
    }

    return socialConnectors.slice(0, 3);
  }, [socialConnectors, displayAll]);

  return (
    <div className={classNames(styles.socialLinkList, className)}>
      {displayConnectors.map((connector) => (
        <SocialLinkButton
          key={connector.id}
          className={styles.socialLinkButton}
          connector={connector}
          onClick={() => {
            void invokeSocialSignIn(connector.id);
          }}
        />
      ))}
      {!displayAll && (
        <ExpandMoreIcon
          onClick={() => {
            setShowAll(true);
          }}
        />
      )}
    </div>
  );
};

export default PrimarySocialSignIn;
