import { noop } from '@silverhand/essentials';
import { createContext } from 'react';

export type LoadingContextValue = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const LoadingContext = createContext<LoadingContextValue>({
  loading: false,
  setLoading: noop,
});

export default LoadingContext;
