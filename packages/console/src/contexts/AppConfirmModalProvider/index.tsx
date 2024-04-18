import type { Nullable } from '@silverhand/essentials';
import { noop } from '@silverhand/essentials';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ConfirmModalProps } from '@/ds-components/ConfirmModal';
import ConfirmModal from '@/ds-components/ConfirmModal';

type ModalContentRenderProps = {
  confirm: (data?: unknown) => void;
  cancel: (data?: unknown) => void;
};

type ConfirmModalType = 'alert' | 'confirm';

type ConfirmModalState = Omit<
  ConfirmModalProps,
  'onCancel' | 'onConfirm' | 'children' | 'isLoading'
> & {
  ModalContent: string | ((props: ModalContentRenderProps) => Nullable<JSX.Element>);
  type: ConfirmModalType;
};

type AppConfirmModalProps = Omit<ConfirmModalState, 'isOpen' | 'type'> & {
  type?: ConfirmModalType;
};

type ConfirmModalContextType = {
  show: (props: AppConfirmModalProps) => Promise<[boolean, unknown?]>;
  confirm: (data?: unknown) => void;
  cancel: (data?: unknown) => void;
};

export const AppConfirmModalContext = createContext<ConfirmModalContextType>({
  show: async () => [true],
  confirm: noop,
  cancel: noop,
});

type Props = {
  readonly children?: React.ReactNode;
};

const defaultModalState: ConfirmModalState = {
  isOpen: false,
  type: 'confirm',
  ModalContent: () => null,
};

function AppConfirmModalProvider({ children }: Props) {
  const [modalState, setModalState] = useState<ConfirmModalState>(defaultModalState);

  const resolver = useRef<(value: [result: boolean, data?: unknown]) => void>();

  const handleShow = useCallback(async ({ type = 'confirm', ...props }: AppConfirmModalProps) => {
    resolver.current?.([false]);

    setModalState({
      isOpen: true,
      type,
      ...props,
    });

    return new Promise<[result: boolean, data?: unknown]>((resolve) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      resolver.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback((data?: unknown) => {
    resolver.current?.([true, data]);
    setModalState(defaultModalState);
  }, []);

  const handleCancel = useCallback((data?: unknown) => {
    resolver.current?.([false, data]);
    setModalState(defaultModalState);
  }, []);

  const contextValue = useMemo(
    () => ({
      show: handleShow,
      confirm: handleConfirm,
      cancel: handleCancel,
    }),
    [handleCancel, handleConfirm, handleShow]
  );

  useEffect(() => {
    const handlePathChange = () => {
      handleCancel();
    };

    /**
     * Note: Close the modal when the location path changes.
     * We don't use react-router-dom's `UseLocation` since this is a global component and not relying on the router.
     */
    window.addEventListener('popstate', handlePathChange);

    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, [handleCancel]);

  const { ModalContent, type, ...restProps } = modalState;

  return (
    <AppConfirmModalContext.Provider value={contextValue}>
      {children}
      <ConfirmModal
        {...restProps}
        onConfirm={type === 'confirm' ? handleConfirm : undefined}
        onCancel={() => {
          handleCancel();
        }}
      >
        {typeof ModalContent === 'string' ? (
          ModalContent
        ) : (
          <ModalContent confirm={handleConfirm} cancel={handleCancel} />
        )}
      </ConfirmModal>
    </AppConfirmModalContext.Provider>
  );
}

export default AppConfirmModalProvider;
