import { createContext, useContext } from 'react';

/**
 * Whether the current user is read-only in the current tenant. Lives apart from the provider so
 * components that only read it do not import the provider's tenant scope fetching.
 */
export const ReadOnlyAccessContext = createContext(false);

/** False until the current tenant's scopes are known to lack write access. */
export const useReadOnlyAccess = () => useContext(ReadOnlyAccessContext);
