import classNames from 'classnames';
import React from 'react';

import { ConnectorData } from '@/types';

import * as styles from './SocialIconButton.module.scss';

type Props = {
  className?: string;
  connector: ConnectorData;
  onClick?: () => void;
};

const SocialIconButton = ({ className, connector, onClick }: Props) => {
  const { target, logo } = connector;

  return (
    <button className={classNames(styles.socialButton, className)} onClick={onClick}>
      {logo && <img src={logo} alt={target} className={styles.icon} />}
    </button>
  );
};

export default SocialIconButton;
