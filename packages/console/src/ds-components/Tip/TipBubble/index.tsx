import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ForwardedRef, ReactNode, HTMLProps, RefObject } from 'react';

import type { HorizontalAlignment, Position } from '@/types/positioning';

import * as styles from './index.module.scss';

export type TipBubblePlacement = 'top' | 'right' | 'bottom' | 'left';

type Props = HTMLProps<HTMLDivElement> & {
  readonly children: ReactNode;
  readonly position?: Position;
  readonly anchorRef: RefObject<Element>;
  readonly placement?: TipBubblePlacement;
  readonly horizontalAlignment?: HorizontalAlignment;
  readonly className?: string;
  readonly isSuccessful?: boolean;
};

const supportHorizontalAlignmentPlacements = new Set<TipBubblePlacement>(['top', 'bottom']);

function TipBubble(
  {
    children,
    position,
    placement = 'bottom',
    horizontalAlignment = 'center',
    className,
    anchorRef,
    isSuccessful,
    ...rest
  }: Props,
  reference: ForwardedRef<HTMLDivElement>
) {
  if (!anchorRef.current) {
    return null;
  }

  const anchorRect = anchorRef.current.getBoundingClientRect();

  const arrowPosition = conditional(
    supportHorizontalAlignmentPlacements.has(placement) &&
      position && {
        left: anchorRect.x + anchorRect.width / 2 - Number(position.left),
      }
  );

  return (
    <div
      {...rest}
      ref={reference}
      className={classNames(
        styles.tipBubble,
        styles[placement],
        !position && styles.invisible,
        isSuccessful && styles.successful,
        className
      )}
      style={{ ...position }}
    >
      {children}
      <div className={styles.arrow} style={{ ...arrowPosition }} />
    </div>
  );
}

export default forwardRef(TipBubble);
