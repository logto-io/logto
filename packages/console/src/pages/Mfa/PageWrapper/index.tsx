import { type ReactNode } from 'react';

import PageMeta from '@/components/PageMeta';
import CardTitle from '@/ds-components/CardTitle';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

function PageWrapper({ children }: Props) {
  return (
    <div className={styles.container}>
      <PageMeta titleKey="mfa.title" />
      <CardTitle title="mfa.title" subtitle="mfa.description" className={styles.cardTitle} />
      {children}
    </div>
  );
}

export default PageWrapper;
