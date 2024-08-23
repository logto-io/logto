import { type SignInIdentifier } from '@logto/schemas';
import { useContext, useMemo } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { type IdentifierInputValue } from '@/components/InputFields/SmartInputField';

import useLoginHint from './use-login-hint';

type Options = {
  enabledIdentifiers?: SignInIdentifier[];
};

const usePrefilledIdentifier = ({ enabledIdentifiers }: Options = {}) => {
  const { identifierInputValue, getIdentifierInputValueByTypes } =
    useContext(UserInteractionContext);

  const loginHint = useLoginHint();

  const cachedInputIdentifier = useMemo(() => {
    return enabledIdentifiers
      ? getIdentifierInputValueByTypes(enabledIdentifiers)
      : identifierInputValue;
  }, [enabledIdentifiers, getIdentifierInputValueByTypes, identifierInputValue]);

  return useMemo<IdentifierInputValue>(() => {
    /**
     * First, check if there's a cached input identifier
     * If there's no cached input identifier, check if there's a valid login hint
     * If there's neither, return empty
     */
    return cachedInputIdentifier ?? { value: loginHint ?? '' };
  }, [cachedInputIdentifier, loginHint]);
};

export default usePrefilledIdentifier;
