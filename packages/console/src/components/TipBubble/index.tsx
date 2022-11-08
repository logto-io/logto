import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ForwardedRef, ReactNode, HTMLProps } from 'react';

import type { HorizontalAlignment } from '@/hooks/use-position';

import * as styles from './index.module.scss';

export type TipBubblePosition = 'top' | 'right' | 'bottom' | 'left';

type Props = HTMLProps<HTMLDivElement> & {
  children: ReactNode;
  position?: TipBubblePosition;
  horizontalAlignment?: HorizontalAlignment;
  className?: string;
};

const supportHorizontalAlignmentPositions = new Set<TipBubblePosition>(['top', 'bottom']);

const TipBubble = (
  { children, position = 'bottom', horizontalAlignment = 'center', className, ...rest }: Props,
  reference: ForwardedRef<HTMLDivElement>
) => {
  return (
    <div
      {...rest}
      ref={reference}
      className={classNames(
        styles.tipBubble,
        styles[position],
        conditional(
          supportHorizontalAlignmentPositions.has(position) && styles[horizontalAlignment]
        ),
        className
      )}
    >
      {children}
    </div>
  );
};

export default forwardRef(TipBubble);
