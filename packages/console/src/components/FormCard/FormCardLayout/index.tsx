import { type ReactNode } from 'react';

import Card from '@/ds-components/Card';

import * as styles from './index.module.scss';

type Props = {
  readonly introduction: ReactNode;
  readonly children: ReactNode;
};

function FormCardLayout({ introduction, children }: Props) {
  return (
    <div className={styles.responsiveWrapper}>
      <Card className={styles.container}>
        <div className={styles.introduction}>{introduction}</div>
        <div className={styles.form}>{children}</div>
      </Card>
    </div>
  );
}

export default FormCardLayout;
