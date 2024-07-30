import type { HorizontalAlignment, VerticalAlignment } from '@/types/positioning';

import type { TipBubblePlacement } from '.';

export const getVerticalOffset = (placement: TipBubblePlacement) => {
  switch (placement) {
    case 'top': {
      return -8;
    }

    case 'bottom': {
      return 8;
    }

    default: {
      return 0;
    }
  }
};

export const getHorizontalOffset = (
  placement: TipBubblePlacement,
  horizontalAlignment: HorizontalAlignment
): number => {
  if (placement === 'top' || placement === 'bottom') {
    switch (horizontalAlignment) {
      case 'start': {
        return -32;
      }

      case 'end': {
        return 32;
      }

      default: {
        return 0;
      }
    }
  } else {
    return placement === 'left' ? -32 : 32;
  }
};

export const getVerticalAlignment = (placement: TipBubblePlacement): VerticalAlignment => {
  switch (placement) {
    case 'top': {
      return 'top';
    }

    case 'bottom': {
      return 'bottom';
    }

    default: {
      return 'middle';
    }
  }
};

export const getHorizontalAlignment = (
  placement: TipBubblePlacement,
  fallback: HorizontalAlignment
): HorizontalAlignment => {
  switch (placement) {
    case 'right': {
      return 'start';
    }

    case 'left': {
      return 'end';
    }

    default: {
      return fallback;
    }
  }
};
