import type { Nullable } from '@silverhand/essentials';
import { noop } from '@silverhand/essentials';
import { useState, useRef, useMemo, createContext, useCallback } from 'react';

import type { ModalProps } from '@/components/ConfirmModal';
import { WebModal, MobileModal } from '@/components/ConfirmModal';
import usePlatform from '@/hooks/use-platform';

type ConfirmModalType = 'alert' | 'confirm';

type ConfirmModalState = Omit<ModalProps, 'onClose' | 'onConfirm' | 'children'> & {
  ModalContent: string | (() => Nullable<JSX.Element>);
  type: ConfirmModalType;
  isConfirmLoading?: boolean;
  isCancelLoading?: boolean;
};

/**
 * Props for promise-based modal usage
 */
type PromiseConfirmModalProps = Omit<ConfirmModalState, 'isOpen' | 'type' | 'isConfirmLoading'> & {
  type?: ConfirmModalType;
};

/**
 * Props for callback-based modal usage
 */
export type CallbackConfirmModalProps = PromiseConfirmModalProps & {
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
};

type ConfirmModalContextType = {
  showPromise: (props: PromiseConfirmModalProps) => Promise<[boolean, unknown?]>;
  showCallback: (props: CallbackConfirmModalProps) => void;
};

export const ConfirmModalContext = createContext<ConfirmModalContextType>({
  showPromise: async () => [true],
  showCallback: noop,
});

type Props = {
  readonly children?: React.ReactNode;
};

const defaultModalState: ConfirmModalState = {
  isOpen: false,
  type: 'confirm',
  ModalContent: () => null,
  isConfirmLoading: false,
  isCancelLoading: false,
};

/**
 * ConfirmModalProvider component
 *
 * This component provides a context for managing confirm modals throughout the application.
 * It supports both promise-based and callback-based usage patterns. see `usePromiseConfirmModal` and `useConfirmModal` hooks.
 */
const ConfirmModalProvider = ({ children }: Props) => {
  const [modalState, setModalState] = useState<ConfirmModalState>(defaultModalState);

  const resolver = useRef<(value: [result: boolean, data?: unknown]) => void>();
  const callbackRef = useRef<{
    onConfirm?: () => Promise<void> | void;
    onCancel?: () => Promise<void> | void;
  }>({});

  const { isMobile } = usePlatform();

  const ConfirmModal = isMobile ? MobileModal : WebModal;

  const handleShowPromise = useCallback(
    async ({ type = 'confirm', ...props }: PromiseConfirmModalProps) => {
      resolver.current?.([false]);

      setModalState({
        isOpen: true,
        type,
        isConfirmLoading: false,
        isCancelLoading: false,
        ...props,
      });

      return new Promise<[result: boolean, data?: unknown]>((resolve) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        resolver.current = resolve;
      });
    },
    []
  );

  const handleShowCallback = useCallback(
    ({ type = 'confirm', onConfirm, onCancel, ...props }: CallbackConfirmModalProps) => {
      resolver.current?.([false]);

      setModalState({
        isOpen: true,
        type,
        isConfirmLoading: false,
        ...props,
      });

      // eslint-disable-next-line @silverhand/fp/no-mutation
      callbackRef.current = { onConfirm, onCancel };
    },
    []
  );

  const handleConfirm = useCallback(async (data?: unknown) => {
    if (callbackRef.current.onConfirm) {
      setModalState((previous) => ({ ...previous, isConfirmLoading: true }));
      await callbackRef.current.onConfirm();
    }
    resolver.current?.([true, data]);
    setModalState(defaultModalState);
  }, []);

  const handleCancel = useCallback(async (data?: unknown) => {
    if (callbackRef.current.onCancel) {
      setModalState((previous) => ({ ...previous, isCancelLoading: true }));
      await callbackRef.current.onCancel();
    }
    resolver.current?.([false, data]);
    setModalState(defaultModalState);
  }, []);

  const contextValue = useMemo(
    () => ({
      showPromise: handleShowPromise,
      showCallback: handleShowCallback,
    }),
    [handleShowPromise, handleShowCallback]
  );

  const { ModalContent, type, ...restProps } = modalState;

  return (
    <ConfirmModalContext.Provider value={contextValue}>
      {children}
      <ConfirmModal
        {...restProps}
        onConfirm={
          type === 'confirm'
            ? () => {
                void handleConfirm();
              }
            : undefined
        }
        onClose={() => {
          void handleCancel();
        }}
      >
        {typeof ModalContent === 'string' ? ModalContent : <ModalContent />}
      </ConfirmModal>
    </ConfirmModalContext.Provider>
  );
};

export default ConfirmModalProvider;
