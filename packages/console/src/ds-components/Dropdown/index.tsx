import classNames from 'classnames';
import type {
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  RefObject,
} from 'react';
import { useRef } from 'react';
import ReactModal from 'react-modal';

import usePosition from '@/hooks/use-position';
import type { HorizontalAlignment } from '@/types/positioning';
import { onKeyDownHandler } from '@/utils/a11y';

import OverlayScrollbar from '../OverlayScrollbar';

import * as styles from './index.module.scss';

export { default as DropdownItem } from './DropdownItem';

type Props = {
  readonly children: ReactNode;
  readonly title?: ReactNode;
  readonly isOpen: boolean;
  readonly onClose?: () => void;
  readonly anchorRef: RefObject<HTMLElement>;
  readonly isFullWidth?: boolean;
  readonly className?: string;
  readonly titleClassName?: string;
  readonly horizontalAlign?: HorizontalAlignment;
  readonly hasOverflowContent?: boolean;
  /** Set to `true` to directly render the dropdown without the overlay. */
  readonly noOverlay?: true;
};

function Div({
  children,
  ...rest
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>) {
  return <div {...rest}>{children}</div>;
}

function Dropdown({
  children,
  title,
  isOpen,
  onClose,
  anchorRef,
  isFullWidth,
  className,
  titleClassName,
  horizontalAlign = 'end',
  hasOverflowContent,
  noOverlay,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const { position, positionState, mutate } = usePosition({
    verticalAlign: 'bottom',
    horizontalAlign,
    offset: { vertical: 4, horizontal: 0 },
    anchorRef,
    overlayRef,
  });

  const WrapperComponent = hasOverflowContent ? Div : OverlayScrollbar;

  return (
    // Using `ReactModal` will cause accessibility issues for multi-select since the dropdown is
    // not a child or sibling of the input element. Thus the tab order will be broken. Consider
    // using something else instead.
    <ReactModal
      shouldCloseOnOverlayClick
      isOpen={isOpen}
      style={{
        content: {
          zIndex: 103,
          width:
            isFullWidth && anchorRef.current
              ? anchorRef.current.getBoundingClientRect().width
              : undefined,
          ...(!position && { opacity: 0 }),
          ...position,
        },
      }}
      shouldFocusAfterRender={false}
      className={classNames(styles.content, positionState.verticalAlign === 'top' && styles.onTop)}
      overlayClassName={styles.overlay}
      overlayElement={noOverlay && ((_, contentElement) => contentElement)}
      onRequestClose={(event) => {
        /**
         * Note:
         * we should stop propagation to prevent the event from bubbling up when we click on the overlay to close the dropdown.
         */
        event.stopPropagation();
        onClose?.();
      }}
      onAfterOpen={mutate}
    >
      <div ref={overlayRef} className={styles.dropdownContainer}>
        {title && <div className={classNames(styles.title, titleClassName)}>{title}</div>}
        <WrapperComponent
          className={className}
          role="menu"
          tabIndex={0}
          onClick={onClose}
          onKeyDown={onKeyDownHandler({ Enter: onClose, Esc: onClose })}
        >
          {children}
        </WrapperComponent>
      </div>
    </ReactModal>
  );
}

export default Dropdown;
