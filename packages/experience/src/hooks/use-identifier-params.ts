import { useSearchParams } from 'react-router-dom';

import { identifierSearchParamGuard } from '@/types/guard';
/**
 * Extracts and validates sign-in identifiers from URL search parameters.
 *
 * Functionality:
 * 1. Extracts all 'identifier' values from the URL search parameters.
 * 2. Validates these values to ensure they are valid `SignInIdentifier`.
 * 3. Returns an array of validated sign-in identifiers.
 */
const useIdentifierParams = () => {
  const [searchParams] = useSearchParams();

  // Todo @xiaoyijun use a constant for the key
  const rawIdentifiers = searchParams.getAll('identifier');
  const [, identifiers = []] = identifierSearchParamGuard.validate(rawIdentifiers);

  return { identifiers };
};

export default useIdentifierParams;
