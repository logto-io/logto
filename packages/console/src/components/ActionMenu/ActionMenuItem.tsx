import React from 'react';

import * as styles from './ActionMenuItem.module.scss';

type Props = {
  children: React.ReactNode;
};

const ActionMenuItem = ({ children }: Props) => <li className={styles.item}>{children}</li>;

export default ActionMenuItem;
