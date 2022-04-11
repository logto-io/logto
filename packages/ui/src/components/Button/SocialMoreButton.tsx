import classNames from 'classnames';
import React from 'react';

import styles from './SocialIconButton.module.scss';

type Props = {
  className?: string;
  onClick?: () => void;
};

const SocialMoreButton = ({ className, onClick }: Props) => {
  return (
    <button
      className={classNames(styles.socialButton, styles.more, className)}
      onClick={() => {
        onClick?.();
      }}
    />
  );
};

export default SocialMoreButton;
