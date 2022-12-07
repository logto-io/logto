import type { HorizontalAlignment, VerticalAlignment } from '@/hooks/use-position';

import type { TipBubblePosition } from '.';

export const getVerticalOffset = (position: TipBubblePosition) => {
  switch (position) {
    case 'top':
      return -16;
    case 'bottom':
      return 16;
    default:
      return 0;
  }
};

export const getHorizontalOffset = (
  tooltipPosition: TipBubblePosition,
  horizontalAlignment: HorizontalAlignment
): number => {
  if (tooltipPosition === 'top' || tooltipPosition === 'bottom') {
    switch (horizontalAlignment) {
      case 'start':
        return -32;
      case 'end':
        return 32;
      default:
        return 0;
    }
  } else {
    return tooltipPosition === 'left' ? -32 : 32;
  }
};

export const getVerticalAlignment = (position: TipBubblePosition): VerticalAlignment => {
  switch (position) {
    case 'top':
      return 'top';
    case 'bottom':
      return 'bottom';
    default:
      return 'middle';
  }
};

export const getHorizontalAlignment = (
  position: TipBubblePosition,
  fallback: HorizontalAlignment
): HorizontalAlignment => {
  switch (position) {
    case 'right':
      return 'start';
    case 'left':
      return 'end';
    default:
      return fallback;
  }
};
