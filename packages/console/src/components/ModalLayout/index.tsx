import { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { ReactNode } from 'react';

import Close from '@/icons/Close';

import Card from '../Card';
import CardTitle from '../CardTitle';
import IconButton from '../IconButton';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  subtitle?: AdminConsoleKey;
  hasFootDecoration?: boolean;
  onClose: () => void;
  content: () => ReactNode;
  footer: () => ReactNode;
};

const ModalLayout = ({
  title,
  subtitle,
  hasFootDecoration = true,
  onClose,
  content,
  footer,
}: Props) => {
  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <CardTitle title={title} subtitle={subtitle} />
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      <div>{content()}</div>
      <div className={classNames(styles.footer, hasFootDecoration && styles.footDecoration)}>
        {footer()}
      </div>
    </Card>
  );
};

export default ModalLayout;
