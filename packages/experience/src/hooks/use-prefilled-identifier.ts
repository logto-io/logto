import { type SignInIdentifier } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import {
  type IdentifierInputType,
  type IdentifierInputValue,
} from '@/components/InputFields/SmartInputField';

import useLoginHint from './use-login-hint';

/**
 * Retrieves the cached identifier input value that the user has inputted based on enabled types.
 * The value will be used to pre-fill the identifier input field in experience pages.
 *
 * @param {IdentifierInputValue} identifierInputValue - The identifier input value to be checked
 * @param {IdentifierInputType[]} enabledTypes - Array of enabled identifier types
 * @returns {IdentifierInputValue | undefined} The identifier input value object or undefined
 *
 * The function checks if the type of identifierInputValue is in the `enabledTypes` array,
 * if the type matches, it returns `identifierInputValue`; otherwise, it returns `undefined`
 *
 * Example:
 * ```ts
 * const value = getIdentifierInputValueByTypes(['email', 'phone']);
 * // Returns `identifierInputValue` if its type is 'email' or 'phone'
 * // Returns `undefined` otherwise
 * ```
 */
const getIdentifierInputValueByTypes = (
  identifierInputValue: IdentifierInputValue,
  enabledTypes: IdentifierInputType[]
): Optional<IdentifierInputValue> => {
  const { type } = identifierInputValue;
  /**
   * Check if the type is included in the enabledTypes array
   * If it is, return identifierInputValue; otherwise, return undefined
   */
  return type && enabledTypes.includes(type) ? identifierInputValue : undefined;
};

type Options = {
  enabledIdentifiers?: SignInIdentifier[];
  /**
   * Whether the current page is the forgot password page
   *
   * Note: since a user may not use the same identifier to sign in and reset password,
   * we need to distinguish between the two scenarios.
   * E.g. the user may only use username to sign in, but only email or phone number can be used to reset password.
   */
  isForgotPassword?: boolean;
};

const usePrefilledIdentifier = ({ enabledIdentifiers, isForgotPassword = false }: Options = {}) => {
  const { identifierInputValue, forgotPasswordIdentifierInputValue } =
    useContext(UserInteractionContext);

  const loginHint = useLoginHint();

  const cachedInputIdentifier = useMemo(() => {
    const identifier = isForgotPassword ? forgotPasswordIdentifierInputValue : identifierInputValue;
    /**
     * If there's no identifier input value or no limitations for enabled identifiers,
     * return the identifier input value as is (which might be undefined)
     */
    if (!identifier || !enabledIdentifiers) {
      return identifier;
    }

    return getIdentifierInputValueByTypes(identifier, enabledIdentifiers);
  }, [
    enabledIdentifiers,
    forgotPasswordIdentifierInputValue,
    identifierInputValue,
    isForgotPassword,
  ]);

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
