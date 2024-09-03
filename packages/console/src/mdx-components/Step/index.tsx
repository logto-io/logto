import { type ReactNode, forwardRef, type Ref } from 'react';

import Index from '@/components/Index';
import CardTitle from '@/ds-components/CardTitle';
import DangerousRaw from '@/ds-components/DangerousRaw';

import styles from './index.module.scss';

export type Props = {
  readonly index?: number;
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
};

function Step({ title, subtitle, index, children }: Props, ref?: Ref<HTMLDivElement>) {
  return (
    <section ref={ref} className={styles.wrapper}>
      <header>
        <Index index={(index ?? 0) + 1} />
        <CardTitle
          size="medium"
          title={<DangerousRaw>{title}</DangerousRaw>}
          subtitle={<DangerousRaw>{subtitle}</DangerousRaw>}
        />
      </header>
      <div>{children}</div>
    </section>
  );
}

export default forwardRef<HTMLDivElement, Props>(Step);
