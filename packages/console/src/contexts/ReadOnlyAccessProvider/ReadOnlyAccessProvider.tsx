import { type ReactNode } from 'react';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

import { ReadOnlyAccessContext } from '.';
import { getIsReadOnlyAccess } from './utils';

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

export default ReadOnlyAccessProvider;
