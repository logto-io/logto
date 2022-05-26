import classNames from 'classnames';
import React, { useMemo, useState, useRef } from 'react';

import MoreSocialIcon from '@/assets/icons/more-social-icon.svg';
import IconButton from '@/components/Button/IconButton';
import SocialIconButton from '@/components/Button/SocialIconButton';
import usePlatform from '@/hooks/use-platform';
import useSocial from '@/hooks/use-social';

import SocialSignInDropdown from '../SocialSignInDropdown';
import SocialSignInPopUp from '../SocialSignInPopUp';
import * as styles from './index.module.scss';

export const defaultSize = 4;

type Props = {
  className?: string;
};

const SecondarySocialSignIn = ({ className }: Props) => {
  const { socialConnectors, invokeSocialSignIn } = useSocial();
  const [showModal, setShowModal] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const { isMobile } = usePlatform();

  const isCollapsed = socialConnectors.length > defaultSize;

  const displayConnectors = useMemo(() => {
    if (isCollapsed) {
      return socialConnectors.slice(0, defaultSize - 1);
    }

    return socialConnectors;
  }, [socialConnectors, isCollapsed]);

  return (
    <>
      <div className={classNames(styles.socialIconList, className)}>
        {displayConnectors.map((connector) => (
          <SocialIconButton
            key={connector.id}
            className={styles.socialButton}
            connector={connector}
            onClick={() => {
              void invokeSocialSignIn(connector.id);
            }}
          />
        ))}
        {isCollapsed && (
          <IconButton
            ref={moreButtonRef}
            className={styles.moreButton}
            onClick={() => {
              setShowModal(true);
            }}
          >
            <MoreSocialIcon />
          </IconButton>
        )}
      </div>
      {isCollapsed && isMobile && (
        <SocialSignInPopUp
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}
      {isCollapsed && !isMobile && (
        <SocialSignInDropdown
          anchorRef={moreButtonRef}
          isOpen={showModal}
          connectors={socialConnectors.slice(defaultSize - 1)}
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default SecondarySocialSignIn;
