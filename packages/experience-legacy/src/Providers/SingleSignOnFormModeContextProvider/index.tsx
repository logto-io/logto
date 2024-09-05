import { useState, useMemo, type ReactNode } from 'react';

import SingleSignOnFormModeContext from './SingleSignOnFormModeContext';

const SingleSignOnFormModeContextProvider = ({ children }: { readonly children: ReactNode }) => {
  const [showSingleSignOnForm, setShowSingleSignOnForm] = useState<boolean>(false);

  const contextValue = useMemo(
    () => ({
      showSingleSignOnForm,
      setShowSingleSignOnForm,
    }),
    [showSingleSignOnForm]
  );

  return (
    <SingleSignOnFormModeContext.Provider value={contextValue}>
      {children}
    </SingleSignOnFormModeContext.Provider>
  );
};

export default SingleSignOnFormModeContextProvider;
