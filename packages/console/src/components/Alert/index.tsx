import { I18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { ReactNode } from 'react';

import LinkButton from '@/components/LinkButton';
import Info from '@/icons/Info';

import * as styles from './index.module.scss';

type Props = {
  severity?: 'info';
  children?: ReactNode;
  action?: I18nKey;
  href?: string;
};

const Alert = ({ children, action, href, severity = 'info' }: Props) => {
  return (
    <div className={classNames(styles.alert, styles[severity])}>
      <div className={styles.icon}>
        <Info />
      </div>
      <div className={styles.content}>{children}</div>
      {action && href && (
        <div className={styles.action}>
          <LinkButton title={action} to={href} />
        </div>
      )}
    </div>
  );
};

export default Alert;
