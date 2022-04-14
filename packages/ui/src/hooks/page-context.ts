import React from 'react';

import { SignInExperienceSettings } from '@/types';

type Context = {
  toast: string;
  loading: boolean;
  setToast: (message: string) => void;
  setLoading: (loading: boolean) => void;
  experienceSettings: SignInExperienceSettings | undefined;
  setExperienceSettings: (settings: SignInExperienceSettings) => void;
};

const NOOP = () => {
  throw new Error('Context provider not found');
};

const PageContext = React.createContext<Context>({
  toast: '',
  loading: false,
  setToast: NOOP,
  setLoading: NOOP,
  experienceSettings: undefined,
  setExperienceSettings: NOOP,
});

export default PageContext;
