import { RefObject, useCallback, useLayoutEffect, useState } from 'react';

type Position = {
  left: number;
  top: number;
};

const safePadding = 20;
const overlayPadding = 4;

export default function usePosition(
  anchorReference: RefObject<HTMLElement>,
  overlayReference: RefObject<HTMLElement>
) {
  const [position, setPosition] = useState<Position>({ left: 0, top: 0 });

  const updatePosition = useCallback(() => {
    if (anchorReference.current && overlayReference.current) {
      const anchor = anchorReference.current.getBoundingClientRect();
      const overlay = overlayReference.current.getBoundingClientRect();
      const isTopSide =
        anchor.y + anchor.height + overlay.height > window.innerHeight - safePadding;
      const isLeftSide = anchor.x + overlay.width > window.innerWidth - safePadding;
      const left = isLeftSide ? anchor.x + anchor.width - overlay.width : anchor.x;
      const top = isTopSide
        ? anchor.y - overlay.height - overlayPadding
        : anchor.y + anchor.height + overlayPadding;
      setPosition({ left, top });
    }
  }, [anchorReference, overlayReference]);

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  return { position, mutate: updatePosition };
}
