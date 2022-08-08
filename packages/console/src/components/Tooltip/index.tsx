import classNames from 'classnames';
import { ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import usePosition, { HorizontalAlignment } from '@/hooks/use-position';

import * as styles from './index.module.scss';

type Props = {
  content: ReactNode | Record<string, unknown>;
  anchorRef: RefObject<Element>;
  className?: string;
  isKeepOpen?: boolean;
  horizontalAlign?: HorizontalAlignment;
};

const getHorizontalOffset = (alignment: HorizontalAlignment): number => {
  switch (alignment) {
    case 'start':
      return -32;
    case 'end':
      return 32;
    default:
      return 0;
  }
};

const Tooltip = ({
  content,
  anchorRef,
  className,
  isKeepOpen = false,
  horizontalAlign = 'start',
}: Props) => {
  const [tooltipDom, setTooltipDom] = useState<HTMLDivElement>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { position, positionState, mutate } = usePosition({
    verticalAlign: 'top',
    horizontalAlign,
    offset: { vertical: 16, horizontal: getHorizontalOffset(horizontalAlign) },
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

  return createPortal(
    <div
      ref={tooltipRef}
      className={classNames(
        styles.tooltip,
        isArrowUp && styles.arrowUp,
        styles[horizontalAlign],
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
