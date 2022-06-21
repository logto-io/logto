import classNames from 'classnames';
import React, { ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import usePosition from '@/hooks/use-position';

import * as styles from './index.module.scss';

type Props = {
  content: ReactNode;
  anchorRef: RefObject<Element>;
  className?: string;
  isKeepOpen?: boolean;
};

const Tooltip = ({ content, anchorRef, className, isKeepOpen = false }: Props) => {
  const [tooltipDom, setTooltipDom] = useState<HTMLDivElement>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { position, positionState, mutate } = usePosition({
    verticalAlign: 'top',
    horizontalAlign: 'center',
    offset: { vertical: 20, horizontal: 0 },
    anchorRef,
    overlayRef: tooltipRef,
  });

  const [showUp, setShowUp] = useState(false);

  useEffect(() => {
    if (!showUp) {
      return;
    }

    const mutateAnimationFrame = requestAnimationFrame(() => {
      mutate();
    });

    return () => {
      cancelAnimationFrame(mutateAnimationFrame);
    };
  }, [showUp, mutate]);

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

    if (isKeepOpen) {
      setShowUp(true);

      return;
    }

    const dom = anchorRef.current;

    const enterHandler = () => {
      if (!showUp) {
        setShowUp(true);
      }
    };

    const leaveHandler = () => {
      setShowUp(false);
    };

    dom.addEventListener('mouseenter', enterHandler);
    dom.addEventListener('mouseleave', leaveHandler);

    return () => {
      dom.removeEventListener('mouseenter', enterHandler);
      dom.removeEventListener('mouseleave', leaveHandler);
    };
  }, [anchorRef, showUp, isKeepOpen]);

  useEffect(() => {
    if (!showUp) {
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
  }, [showUp, tooltipDom]);

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
      className={classNames(styles.tooltip, isArrowUp && styles.arrowUp, className)}
      style={{ ...position }}
    >
      {content}
    </div>,
    tooltipDom
  );
};

export default Tooltip;
