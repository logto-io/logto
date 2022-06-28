import classNames from 'classnames';
import React from 'react';

import * as styles from './SocialIconButton.module.scss';

type Props = {
  className?: string;
  logo: string;
  target?: string;
  onClick?: () => void;
};

const SocialIconButton = ({ className, logo, target, onClick }: Props) => {
  const inverseBackground = target === 'apple';

  return (
    <button
      className={classNames(styles.socialButton, inverseBackground && styles.inverse, className)}
      onClick={onClick}
    >
      {logo && <img src={logo} alt={target} className={styles.icon} />}
    </button>
  );
};

export default SocialIconButton;
