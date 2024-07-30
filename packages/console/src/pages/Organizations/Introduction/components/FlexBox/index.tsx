import classNames from 'classnames';
import { type CSSProperties, type PropsWithChildren } from 'react';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly type?: 'row' | 'column';
  /* Flex item gap in pixel value. Defaults to 12px. */
  readonly gap?: number;
  readonly style?: CSSProperties;
  /* If the children items should equally divide the container space. Defaults to `false` */
  readonly isEquallyDivided?: boolean;
  readonly onMouseOver?: () => void;
  readonly onMouseOut?: () => void;
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
