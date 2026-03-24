import { useMemo } from 'react';

import { getIdentifier, clearIdentifier } from '@ac/utils/account-center-route';

/**
 * Read and consume the stored identifier URL parameter.
 * The value is cleared after first read (one-time use).
 */
const useIdentifierParam = (): string | undefined => {
  return useMemo(() => {
    const value = getIdentifier();
    if (value) {
      clearIdentifier();
    }
    return value;
  }, []);
};

export default useIdentifierParam;
