import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import usePosition from '@/hooks/use-position';
import type { HorizontalAlignment } from '@/types/positioning';

import TipBubble from '../TipBubble';
import type { TipBubblePlacement } from '../TipBubble';
import {
  getVerticalAlignment,
  getHorizontalAlignment,
  getVerticalOffset,
  getHorizontalOffset,
} from '../TipBubble/utils';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly isKeepOpen?: boolean;
  readonly isSuccessful?: boolean;
  readonly placement?: TipBubblePlacement;
  readonly horizontalAlign?: HorizontalAlignment;
  readonly anchorClassName?: string;
  readonly children?: ReactNode;
  readonly content?: ReactNode;
};

function Tooltip({
  className,
  isKeepOpen = false,
  isSuccessful = false,
  placement = 'top',
  horizontalAlign = 'center',
  anchorClassName,
  children,
  content,
}: Props) {
  const [tooltipDom, setTooltipDom] = useState<HTMLDivElement>();
  const anchorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { position, positionState, mutate } = usePosition({
    verticalAlign: getVerticalAlignment(placement),
    horizontalAlign: getHorizontalAlignment(placement, horizontalAlign),
    offset: {
      vertical: getVerticalOffset(placement),
      horizontal: getHorizontalOffset(placement, horizontalAlign),
    },
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
  }, [mutate, content]);

  return (
    <>
      <div ref={anchorRef} className={classNames(styles.anchor, anchorClassName)}>
        {children}
      </div>
      {tooltipDom &&
        content &&
        createPortal(
          <TipBubble
            ref={tooltipRef}
            anchorRef={anchorRef}
            className={className}
            position={position}
            placement={placement}
            horizontalAlignment={positionState.horizontalAlign}
            isSuccessful={isSuccessful}
          >
            {content}
          </TipBubble>,
          tooltipDom
        )}
    </>
  );
}

export default Tooltip;
