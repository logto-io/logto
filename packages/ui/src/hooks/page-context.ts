import React from 'react';

type Context = {
  toast: string;
  loading: boolean;
  setToast: (message: string) => void;
  setLoading: (loading: boolean) => void;
};

const NOOP = () => {
  throw new Error('Context provider not found');
};

const PageContext = React.createContext<Context>({
  toast: '',
  loading: false,
  setToast: NOOP,
  setLoading: NOOP,
});

export default PageContext;
