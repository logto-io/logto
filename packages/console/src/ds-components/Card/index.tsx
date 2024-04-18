import classNames from 'classnames';
import type { Ref, ReactNode } from 'react';
import { forwardRef } from 'react';

import * as styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
  readonly className?: string;
};

function Card(props: Props, reference?: Ref<HTMLDivElement>) {
  const { children, className } = props;

  return (
    <div ref={reference} className={classNames(styles.card, className)}>
      {children}
    </div>
  );
}

export default forwardRef<HTMLDivElement, Props>(Card);
