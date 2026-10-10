import { createContext, useContext, type ReactNode } from 'react';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

import { getIsReadOnlyAccess } from './utils';

const ReadOnlyAccessContext = createContext(false);

type Props = {
  readonly children: ReactNode;
};

function ReadOnlyAccessProvider({ children }: Props) {
  const { scopes } = useCurrentTenantScopes();

  // Read-only tenant access ships behind dev features: never read-only until it is released.
  return (
    <ReadOnlyAccessContext.Provider
      value={getIsReadOnlyAccess({ isDevFeaturesEnabled, isCloud, scopes })}
    >
      {children}
    </ReadOnlyAccessContext.Provider>
  );
}

/** False until the current tenant's scopes are known to lack write access. */
export const useReadOnlyAccess = () => useContext(ReadOnlyAccessContext);

export default ReadOnlyAccessProvider;
