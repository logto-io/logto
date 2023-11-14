import classNames from 'classnames';
import { type CSSProperties, type PropsWithChildren } from 'react';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  type?: 'row' | 'column';
  /* Flex item gap in pixel value. Defaults to 12px. */
  gap?: number;
  style?: CSSProperties;
  /* If the children items should equally divide the container space. Defaults to `false` */
  isEquallyDivided?: boolean;
};

function FlexBox({
  className,
  type = 'row',
  gap = 12,
  style,
  isEquallyDivided,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div
      className={classNames(
        styles.flexBox,
        styles[type],
        isEquallyDivided && styles.equallyDivided,
        className
      )}
      style={{ gap: `${gap}px`, ...style }}
    >
      {children}
    </div>
  );
}

export default FlexBox;
