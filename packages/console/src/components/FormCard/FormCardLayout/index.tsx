import { type ReactNode } from 'react';

import Card from '@/ds-components/Card';

import * as styles from './index.module.scss';

type Props = {
  introduction: ReactNode;
  children: ReactNode;
};

function FormCardLayout({ introduction, children }: Props) {
  return (
    <Card className={styles.container}>
      <div className={styles.introduction}>{introduction}</div>
      <div className={styles.form}>{children}</div>
    </Card>
  );
}

export default FormCardLayout;
