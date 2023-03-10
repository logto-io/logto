import type { ReactNode } from 'react';
import { useCallback, useContext } from 'react';

import Toast from '@/components/Toast';
import { PageContext } from '@/hooks/use-page-context';

type Props = {
  children: ReactNode;
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
