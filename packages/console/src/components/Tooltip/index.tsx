import classNames from 'classnames';
import type { ReactNode, RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { VerticalAlignment, HorizontalAlignment } from '@/hooks/use-position';
import usePosition from '@/hooks/use-position';

import * as styles from './index.module.scss';

type Props = {
  content: ReactNode | Record<string, unknown>;
  anchorRef: RefObject<Element>;
  className?: string;
  isKeepOpen?: boolean;
  verticalAlign?: VerticalAlignment;
  horizontalAlign?: HorizontalAlignment;
  flip?: 'right' | 'left';
};

const getHorizontalOffset = (alignment: HorizontalAlignment, flipped: string): number => {
  switch (alignment) {
    case 'start':
      return flipped === 'right' ? 32 : -32;
    case 'end':
      return flipped === 'left' ? -32 : 32;
    default:
      return 0;
  }
};

const Tooltip = ({
  content,
  anchorRef,
  className,
  isKeepOpen = false,
  verticalAlign = 'top',
  horizontalAlign = 'start',
  flip,
}: Props) => {
  const [tooltipDom, setTooltipDom] = useState<HTMLDivElement>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { position, positionState, mutate } = usePosition({
    verticalAlign,
    horizontalAlign,
    offset: { vertical: 16, horizontal: getHorizontalOffset(horizontalAlign, flip ?? '') },
    anchorRef,
    overlayRef: tooltipRef,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const mutateAnimationFrame = requestAnimationFrame(() => {
      mutate();
    });

    return () => {
      cancelAnimationFrame(mutateAnimationFrame);
    };
  }, [isVisible, mutate]);

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

    if (isKeepOpen) {
      setIsVisible(true);

      return;
    }

    const dom = anchorRef.current;

    const enterHandler = () => {
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const leaveHandler = () => {
      setIsVisible(false);
    };

    dom.addEventListener('mouseenter', enterHandler);
    dom.addEventListener('mouseleave', leaveHandler);

    return () => {
      dom.removeEventListener('mouseenter', enterHandler);
      dom.removeEventListener('mouseleave', leaveHandler);
    };
  }, [anchorRef, isVisible, isKeepOpen]);

  useEffect(() => {
    if (!isVisible) {
      if (tooltipDom) {
        tooltipDom.remove();
        setTooltipDom(undefined);
      }

      return;
    }

    if (!tooltipDom) {
      const dom = document.createElement('div');
      document.body.append(dom);
      setTooltipDom(dom);
    }

    return () => tooltipDom?.remove();
  }, [isVisible, tooltipDom]);

  useLayoutEffect(() => {
    mutate();
  }, [content, mutate]);

  if (!tooltipDom) {
    return null;
  }

  const isArrowUp = positionState.verticalAlign === 'bottom';
  const isArrowRight = flip === 'left' && positionState.horizontalAlign === 'end';
  const isArrowLeft = flip === 'right' && positionState.horizontalAlign === 'start';

  return createPortal(
    <div
      ref={tooltipRef}
      className={classNames(
        styles.tooltip,
        isArrowUp && styles.arrowUp,
        isArrowRight && styles.arrowRight,
        isArrowLeft && styles.arrowLeft,
        !flip && styles[horizontalAlign],
        className
      )}
      style={{ ...position }}
    >
      <div className={styles.content}>{content}</div>
    </div>,
    tooltipDom
  );
};

export default Tooltip;
