import { ExtraParamsKey, type SignInIdentifier, signInIdentifierGuard } from '@logto/schemas';
import { useSearchParams } from 'react-router-dom';

/**
 * Parses and validates a string of space-separated identifiers.
 *
 * @param value - A string containing space-separated identifiers (e.g., "email phone").
 * @returns An array of validated SignInIdentifier objects.
 */
const parseIdentifierParamValue = (value: string): SignInIdentifier[] => {
  const identifiers = value.split(' ');

  return identifiers.reduce<SignInIdentifier[]>((result, identifier) => {
    const parsed = signInIdentifierGuard.safeParse(identifier);
    return parsed.success ? [...result, parsed.data] : result;
  }, []);
};

/**
 * Custom hook to extract and validate sign-in identifiers from URL search parameters.
 *
 * Functionality:
 * 1. Extracts the 'identifier' value from the URL search parameters.
 * 2. Parses the identifier string, which is expected to be in the format "email phone",
 *    where multiple identifiers are separated by spaces.
 * 3. Validates each parsed identifier to ensure it is a valid `SignInIdentifier`.
 * 4. Returns an array of validated sign-in identifiers.
 *
 * @returns An object containing the array of parsed and validated identifiers.
 */
const useIdentifierParams = () => {
  const [searchParams] = useSearchParams();

  const identifiers = parseIdentifierParamValue(searchParams.get(ExtraParamsKey.Identifier) ?? '');

  return { identifiers };
};

export default useIdentifierParams;
