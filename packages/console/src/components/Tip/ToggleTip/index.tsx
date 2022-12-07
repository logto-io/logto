import type { ReactNode } from 'react';
import { useCallback, useState, useRef } from 'react';
import ReactModal from 'react-modal';

import type { HorizontalAlignment } from '@/hooks/use-position';
import usePosition from '@/hooks/use-position';
import { onKeyDownHandler } from '@/utilities/a11y';

import type { TipBubblePosition } from '../TipBubble';
import TipBubble from '../TipBubble';
import {
  getVerticalAlignment,
  getHorizontalAlignment,
  getVerticalOffset,
  getHorizontalOffset,
} from '../TipBubble/utils';
import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  className?: string;
  anchorClassName?: string;
  position?: TipBubblePosition;
  horizontalAlign?: HorizontalAlignment;
  content?: ((closeTip: () => void) => ReactNode) | ReactNode;
};

const ToggleTip = ({
  children,
  className,
  anchorClassName,
  position = 'top',
  horizontalAlign = 'center',
  content,
}: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const {
    position: layoutPosition,
    positionState,
    mutate,
  } = usePosition({
    verticalAlign: getVerticalAlignment(position),
    horizontalAlign: getHorizontalAlignment(position, horizontalAlign),
    offset: {
      vertical: getVerticalOffset(position),
      horizontal: getHorizontalOffset(position, horizontalAlign),
    },
    anchorRef,
    overlayRef,
  });

  return (
    <>
      <div
        ref={anchorRef}
        role="tab"
        tabIndex={0}
        className={anchorClassName}
        onClick={() => {
          setIsOpen(true);
        }}
        onKeyDown={onKeyDownHandler(() => {
          setIsOpen(true);
        })}
      >
        {children}
      </div>
      <ReactModal
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        isOpen={isOpen}
        style={{
          content: {
            ...(!layoutPosition && { opacity: 0 }),
            ...layoutPosition,
          },
        }}
        className={styles.content}
        overlayClassName={styles.overlay}
        onRequestClose={onClose}
        onAfterOpen={mutate}
      >
        <TipBubble
          ref={overlayRef}
          position={position}
          className={className}
          horizontalAlignment={positionState.horizontalAlign}
        >
          {typeof content === 'function' ? content(onClose) : content}
        </TipBubble>
      </ReactModal>
    </>
  );
};

export default ToggleTip;
