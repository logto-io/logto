import { type ReactNode } from 'react';

import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

import { ReadOnlyFieldContext } from '.';

type Props = {
  readonly children: ReactNode;
};

/** For a read-only member, locks the inputs inside it that read `useReadOnlyField()`. */
function ReadOnlyFieldScope({ children }: Props) {
  const {
    access: { isReadOnly },
  } = useCurrentTenantScopes();

  return (
    <ReadOnlyFieldContext.Provider value={isReadOnly}>{children}</ReadOnlyFieldContext.Provider>
  );
}

export default ReadOnlyFieldScope;
