import type { HTMLProps, ReactNode, RefObject } from 'react';
import { useRef } from 'react';
import ReactModal from 'react-modal';

import type { HorizontalAlignment } from '@/hooks/use-position';
import usePosition from '@/hooks/use-position';

import type { TipBubblePosition } from '../TipBubble';
import TipBubble from '../TipBubble';
import {
  getVerticalAlignment,
  getHorizontalAlignment,
  getVerticalOffset,
  getHorizontalOffset,
} from '../TipBubble/utils';
import * as styles from './index.module.scss';

type Props = HTMLProps<HTMLDivElement> & {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement>;
  position?: TipBubblePosition;
  horizontalAlign?: HorizontalAlignment;
};

const ToggleTip = ({
  children,
  isOpen,
  onClose,
  anchorRef,
  position = 'top',
  horizontalAlign = 'start',
}: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null);

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
    <ReactModal
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      isOpen={isOpen}
      style={{
        content: {
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
        horizontalAlignment={positionState.horizontalAlign}
      >
        {children}
      </TipBubble>
    </ReactModal>
  );
};

export default ToggleTip;
