import { noop } from '@silverhand/essentials';
import { createContext, useMemo, useRef, useState } from 'react';

type SignInExperienceContextType = {
  isUploading: boolean;
  cancelUpload?: () => void;
  setIsUploading: (value: boolean) => void;
  setCancelUpload: (cancelFunction?: () => void) => void;
};

type Props = {
  readonly children?: React.ReactNode;
};

export const SignInExperienceContext = createContext<SignInExperienceContextType>({
  isUploading: false,
  cancelUpload: noop,
  setIsUploading: noop,
  setCancelUpload: noop,
});

function SignInExperienceContextProvider({ children }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const cancelUploadRef = useRef<() => void>();

  const handleSetCancelUpload = (cancelFunction?: () => void) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    cancelUploadRef.current = cancelFunction;
  };

  const contextValue = useMemo(
    () => ({
      isUploading,
      cancelUpload: cancelUploadRef.current,
      setIsUploading,
      setCancelUpload: handleSetCancelUpload,
    }),
    [isUploading]
  );

  return (
    <SignInExperienceContext.Provider value={contextValue}>
      {children}
    </SignInExperienceContext.Provider>
  );
}

export default SignInExperienceContextProvider;
