import { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';
import React from 'react';

import * as styles from './SocialIconButton.module.scss';

type Props = {
  className?: string;
  connector: Pick<ConnectorMetadata, 'id' | 'logo'>;
  onClick?: () => void;
};

const SocialIconButton = ({ className, connector, onClick }: Props) => {
  const { id, logo } = connector;

  return (
    <button className={classNames(styles.socialButton, className)} onClick={onClick}>
      {logo && <img src={logo} alt={id} className={styles.icon} />}
    </button>
  );
};

export default SocialIconButton;
