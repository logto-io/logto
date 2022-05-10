import classNames from 'classnames';
import React, { useMemo, useState } from 'react';

import SocialIconButton from '@/components/Button/SocialIconButton';
import MoreSocialIcon from '@/components/Icons/MoreSocialIcon';
import useSocial from '@/hooks/use-social';

import SocialSignInPopUp from './SocialSignInPopUp';
import * as styles from './index.module.scss';

export const defaultSize = 4;

type Props = {
  className?: string;
};

const SecondarySocialSignIn = ({ className }: Props) => {
  const { socialConnectors, invokeSocialSignIn } = useSocial();
  const isOverSize = socialConnectors.length > defaultSize;
  const [showModal, setShowModal] = useState(false);

  const displayConnectors = useMemo(() => {
    if (isOverSize) {
      return socialConnectors.slice(0, defaultSize - 1);
    }

    return socialConnectors;
  }, [socialConnectors, isOverSize]);

  return (
    <>
      <div className={classNames(styles.socialIconList, className)}>
        {displayConnectors.map((connector) => (
          <SocialIconButton
            key={connector.target}
            className={styles.socialButton}
            connector={connector}
            onClick={() => {
              void invokeSocialSignIn(connector.target);
            }}
          />
        ))}
        {isOverSize && (
          <MoreSocialIcon
            className={styles.socialButton}
            onClick={() => {
              setShowModal(true);
            }}
          />
        )}
      </div>
      {isOverSize && (
        <SocialSignInPopUp
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default SecondarySocialSignIn;
