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
  onMouseOver?: () => void;
  onMouseOut?: () => void;
};

function FlexBox({
  className,
  children,
  type = 'row',
  gap = 12,
  style,
  isEquallyDivided,
  onMouseOver,
  onMouseOut,
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
      onFocus={onMouseOver}
      onBlur={onMouseOut}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {children}
    </div>
  );
}

export default FlexBox;
