import { useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

const useToast = () => {
  const { toast, setToast } = useContext(PageContext);

  return { toast, setToast };
};

export default useToast;
