import { RefObject, useCallback, useLayoutEffect, useState } from 'react';

type Position = {
  left: number;
  top: number;
  width: number;
  isOnTop?: boolean;
};

export type HorizontalAlignment = 'left' | 'right';

// Leave space for box-shadow effect.
const safePadding = 12;
// The distance to anchor
const distance = 4;

export default function usePosition(
  anchorRef: RefObject<HTMLElement>,
  overlayRef: RefObject<HTMLElement>,
  horizontalAlign: HorizontalAlignment = 'left'
) {
  const [position, setPosition] = useState<Position>();
  const isRightAligned = horizontalAlign === 'right';

  const updatePosition = useCallback(() => {
    if (anchorRef.current && overlayRef.current) {
      const anchor = anchorRef.current.getBoundingClientRect();
      const overlay = overlayRef.current.getBoundingClientRect();
      const isOnTop = anchor.y + anchor.height + overlay.height > window.innerHeight - safePadding;
      const isOnLeft = anchor.x + overlay.width > window.innerWidth - safePadding;
      const left = isOnLeft || isRightAligned ? anchor.x + anchor.width - overlay.width : anchor.x;
      const top = isOnTop
        ? anchor.y - overlay.height - distance
        : anchor.y + anchor.height + distance;
      setPosition({ left, top, width: anchor.width, isOnTop });
    }
  }, [anchorRef, isRightAligned, overlayRef]);

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  return { position, mutate: updatePosition };
}
