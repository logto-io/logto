import classNames from 'classnames';
import React, { useState, useMemo } from 'react';

import SocialLinkButton from '@/components/Button/SocialLinkButton';
import { ExpandMoreIcon } from '@/components/Icons';
import useSocial from '@/hooks/use-social';

import * as styles from './index.module.scss';

export const defaultSize = 3;

type Props = {
  className?: string;
  isPopup?: boolean;
  onSocialSignInCallback?: () => void;
};

const PrimarySocialSignIn = ({ className, isPopup = false, onSocialSignInCallback }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const { invokeSocialSignIn, socialConnectors } = useSocial({ onSocialSignInCallback });
  const isOverSize = socialConnectors.length > defaultSize;
  const fullDisplay = isPopup || !isOverSize;

  const displayConnectors = useMemo(() => {
    if (fullDisplay || showAll) {
      return socialConnectors;
    }

    return socialConnectors.slice(0, defaultSize);
  }, [fullDisplay, showAll, socialConnectors]);

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
      {!fullDisplay && (
        <ExpandMoreIcon
          className={classNames(styles.expandIcon, showAll && styles.expanded)}
          onClick={() => {
            setShowAll(!showAll);
          }}
        />
      )}
    </div>
  );
};

export default PrimarySocialSignIn;
