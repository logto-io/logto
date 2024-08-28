import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useCallback, useState, useRef } from 'react';
import ReactModal from 'react-modal';

import usePosition from '@/hooks/use-position';
import * as modalStyles from '@/scss/modal.module.scss';
import type { HorizontalAlignment } from '@/types/positioning';
import { onKeyDownHandler } from '@/utils/a11y';

import type { TipBubblePlacement } from '../TipBubble';
import TipBubble from '../TipBubble';
import {
  getVerticalAlignment,
  getHorizontalAlignment,
  getVerticalOffset,
  getHorizontalOffset,
} from '../TipBubble/utils';

import * as styles from './index.module.scss';

export type Props = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly anchorClassName?: string;
  readonly placement?: TipBubblePlacement;
  readonly horizontalAlign?: HorizontalAlignment;
  readonly content?: ((closeTip: () => void) => ReactNode) | ReactNode;
};

function ToggleTip({
  children,
  className,
  anchorClassName,
  placement = 'top',
  horizontalAlign = 'center',
  content,
}: Props) {
  const tipBubbleRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const openTip = useCallback(() => {
    setIsOpen(true);
    /**
     * Note: should focus on the anchor wrapper element after the tip bubble is opened,
     * or the hover state will not be removed from its child element, and this will cause the child element to have a hover state after the tip bubble is closed.
     */
    anchorRef.current?.focus();
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const {
    position: layoutPosition,
    positionState,
    mutate,
  } = usePosition({
    verticalAlign: getVerticalAlignment(placement),
    horizontalAlign: getHorizontalAlignment(placement, horizontalAlign),
    offset: {
      vertical: getVerticalOffset(placement),
      horizontal: getHorizontalOffset(placement, horizontalAlign),
    },
    anchorRef,
    overlayRef: tipBubbleRef,
  });

  return (
    <>
      <div
        ref={anchorRef}
        role="tab"
        tabIndex={0}
        className={anchorClassName}
        onClick={openTip}
        onKeyDown={onKeyDownHandler(openTip)}
      >
        {children}
      </div>
      <ReactModal
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        isOpen={isOpen}
        className={styles.content}
        overlayClassName={classNames(modalStyles.overlay, styles.overlay)}
        onRequestClose={onClose}
        onAfterOpen={mutate}
      >
        <TipBubble
          ref={tipBubbleRef}
          anchorRef={anchorRef}
          position={layoutPosition}
          placement={placement}
          className={className}
          horizontalAlignment={positionState.horizontalAlign}
        >
          {typeof content === 'function' ? content(onClose) : content}
        </TipBubble>
      </ReactModal>
    </>
  );
}

export default ToggleTip;
