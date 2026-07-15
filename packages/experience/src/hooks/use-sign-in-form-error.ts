import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { object, string, validate } from 'superstruct';

const signInFormErrorStateGuard = object({
  errorMessage: string(),
});

export const getSignInFormErrorState = (errorMessage: string) => ({ errorMessage });

const useSignInFormError = () => {
  const { state } = useLocation();
  const [, parsedState] = validate(state, signInFormErrorStateGuard);
  const [errorMessage, setErrorMessage] = useState(parsedState?.errorMessage);

  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  return { errorMessage, clearErrorMessage };
};

export default useSignInFormError;
