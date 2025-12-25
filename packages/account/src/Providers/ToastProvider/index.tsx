import Toast from '@experience/shared/components/Toast';
import type { ReactNode } from 'react';
import { useCallback, useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';

type Props = {
  readonly children: ReactNode;
};

const ToastProvider = ({ children }: Props) => {
  const { toast, setToast } = useContext(PageContext);

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
