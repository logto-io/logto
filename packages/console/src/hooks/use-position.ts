import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { HorizontalAlignment, Offset, Position, VerticalAlignment } from '@/types/positioning';

type Props = {
  verticalAlign: VerticalAlignment;
  horizontalAlign: HorizontalAlignment;
  offset: Offset;
  anchorRef: RefObject<Element>;
  overlayRef: RefObject<Element>;
};

// Leave space for box-shadow effect.
const windowSafePadding = 12;

const selectVerticalAlignment = ({
  verticalAlign,
  verticalTop,
  verticalMiddle,
  verticalBottom,
  overlayHeight,
}: {
  verticalAlign: VerticalAlignment;
  verticalTop: number;
  verticalMiddle: number;
  verticalBottom: number;
  overlayHeight: number;
}): VerticalAlignment => {
  const minY = windowSafePadding;
  const maxY = window.innerHeight - windowSafePadding;

  const isTopAllowed = verticalTop >= minY;
  const isCenterAllowed =
    verticalMiddle - overlayHeight / 2 >= minY && verticalMiddle + overlayHeight / 2 <= maxY;
  const isBottomAllowed = verticalBottom + overlayHeight <= maxY;

  switch (verticalAlign) {
    case 'top': {
      if (isTopAllowed) {
        return 'top';
      }

      if (isBottomAllowed) {
        return 'bottom';
      }

      if (isCenterAllowed) {
        return 'middle';
      }

      return verticalAlign;
    }

    case 'middle': {
      if (isCenterAllowed) {
        return 'middle';
      }

      if (isTopAllowed) {
        return 'top';
      }

      if (isBottomAllowed) {
        return 'bottom';
      }

      return verticalAlign;
    }

    case 'bottom': {
      if (isBottomAllowed) {
        return 'bottom';
      }

      if (isTopAllowed) {
        return 'top';
      }

      if (isCenterAllowed) {
        return 'middle';
      }

      return verticalAlign;
    }
  }
};

const selectHorizontalAlignment = ({
  horizontalAlign,
  horizontalStart,
  horizontalCenter,
  horizontalEnd,
  overlayWidth,
}: {
  horizontalAlign: HorizontalAlignment;
  horizontalStart: number;
  horizontalCenter: number;
  horizontalEnd: number;
  overlayWidth: number;
}) => {
  const minX = windowSafePadding;
  const maxX = window.innerWidth - windowSafePadding;

  const isStartAllowed = horizontalStart + overlayWidth <= maxX;
  const isCenterAllowed =
    horizontalCenter - overlayWidth / 2 >= minX && horizontalCenter + overlayWidth / 2 <= maxX;
  const isEndAllowed = horizontalEnd >= minX;

  switch (horizontalAlign) {
    case 'start': {
      if (isStartAllowed) {
        return 'start';
      }

      if (isEndAllowed) {
        return 'end';
      }

      if (isCenterAllowed) {
        return 'center';
      }

      return horizontalAlign;
    }

    case 'center': {
      if (isCenterAllowed) {
        return 'center';
      }

      if (isStartAllowed) {
        return 'start';
      }

      if (isEndAllowed) {
        return 'end';
      }

      return horizontalAlign;
    }

    case 'end': {
      if (isEndAllowed) {
        return 'end';
      }

      if (isStartAllowed) {
        return 'start';
      }

      if (isCenterAllowed) {
        return 'center';
      }

      return horizontalAlign;
    }
  }
};

export default function usePosition({
  verticalAlign,
  horizontalAlign,
  offset,
  anchorRef,
  overlayRef,
}: Props) {
  const [position, setPosition] = useState<Position>();
  const [currentVerticalAlign, setCurrentVerticalAlign] = useState(verticalAlign);
  const [currentHorizontalAlign, setCurrentHorizontalAlign] = useState(horizontalAlign);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current || !overlayRef.current) {
      return;
    }

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();

    const verticalTop = anchorRect.y - overlayRect.height + offset.vertical;
    const verticalMiddle =
      anchorRect.y + anchorRect.height / 2 - overlayRect.height / 2 + offset.vertical;
    const verticalBottom = anchorRect.y + anchorRect.height + offset.vertical;

    const verticalPositionMap = {
      top: verticalTop,
      middle: verticalMiddle,
      bottom: verticalBottom,
    };

    const horizontalStart = anchorRect.x + offset.horizontal;
    const horizontalCenter =
      anchorRect.x + anchorRect.width / 2 - overlayRect.width / 2 + offset.horizontal;
    const horizontalEnd = anchorRect.x + anchorRect.width - overlayRect.width + offset.horizontal;

    const horizontalPositionMap = {
      start: horizontalStart,
      center: horizontalCenter,
      end: horizontalEnd,
    };

    const selectedVerticalAlign = selectVerticalAlignment({
      verticalAlign,
      verticalTop,
      verticalMiddle,
      verticalBottom,
      overlayHeight: overlayRect.height,
    });

    const selectedHorizontalAlign = selectHorizontalAlignment({
      horizontalAlign,
      horizontalStart,
      horizontalCenter,
      horizontalEnd,
      overlayWidth: overlayRect.width,
    });

    setCurrentVerticalAlign(selectedVerticalAlign);
    setCurrentHorizontalAlign(selectedHorizontalAlign);
    setPosition({
      top: verticalPositionMap[selectedVerticalAlign],
      left: horizontalPositionMap[selectedHorizontalAlign],
    });
  }, [anchorRef, horizontalAlign, offset.vertical, offset.horizontal, overlayRef, verticalAlign]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

  return {
    position,
    mutate: updatePosition,
    positionState: {
      verticalAlign: currentVerticalAlign,
      horizontalAlign: currentHorizontalAlign,
    },
  };
}
