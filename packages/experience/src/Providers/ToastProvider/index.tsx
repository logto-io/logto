import type { ReactNode } from 'react';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import Toast from '@/components/Toast';

type Props = {
  readonly children: ReactNode;
};

const ToastProvider = ({ children }: Props) => {
  const { toast, setToast } = useContext(PageContext);

  // Prevent internal eventListener rebind
  const hideToast = useCallback(() => {
    setToast('');
  }, [setToast]);

  return (
    <>
      {children}
      <Toast message={toast} callback={hideToast} />
    </>
  );
};

export default ToastProvider;
