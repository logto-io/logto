import classNames from 'classnames';
import React, { forwardRef, LegacyRef, ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  className?: string;
};

const Card = (props: Props, reference?: LegacyRef<HTMLDivElement>) => {
  const { children, className } = props;

  return (
    <div ref={reference} className={classNames(styles.card, className)}>
      {children}
    </div>
  );
};

export default forwardRef<HTMLDivElement, Props>(Card);
