import React, { useState, useMemo } from 'react';

import PageContext from '@/hooks/page-context';
import { SignInExperienceSettings } from '@/types';

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [experienceSettings, setExperienceSettings] = useState<SignInExperienceSettings>();

  const context = useMemo(
    () => ({ loading, setLoading, toast, setToast, experienceSettings, setExperienceSettings }),
    [experienceSettings, loading, toast]
  );

  return <PageContext.Provider value={context}>{children}</PageContext.Provider>;
};

export default ContextProvider;
