import { noop } from '@silverhand/essentials';
import { useState, useMemo, createContext, useContext } from 'react';

import usePlatform from '@/hooks/use-platform';

import IframeModal from './IframeModal';

type ModalState = {
  href?: string;
  title?: string;
};

export const IframeModalContext = createContext<
  ModalState & { setModalState: (props: ModalState) => void }
>({
  href: undefined,
  title: undefined,
  setModalState: noop,
});

export const useIframeModal = () => useContext(IframeModalContext);

type Props = {
  readonly children: React.ReactNode;
};

const IframeModalProvider = ({ children }: Props) => {
  const [modalState, setModalState] = useState<ModalState>();
  const { isMobile } = usePlatform();

  const context = useMemo(
    () => ({
      ...modalState,
      setModalState,
    }),
    [modalState]
  );

  return (
    <IframeModalContext.Provider value={context}>
      {children}
      {isMobile && (
        <IframeModal
          href={modalState?.href}
          title={modalState?.title}
          onClose={() => {
            setModalState(undefined);
          }}
        />
      )}
    </IframeModalContext.Provider>
  );
};

export default IframeModalProvider;
