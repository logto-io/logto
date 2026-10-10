import { createContext, useContext, type ReactNode } from 'react';

/**
 * Whether the current user is read-only in the current tenant. Lives apart from the provider so
 * components that only read it do not import the provider's tenant scope fetching.
 */
export const ReadOnlyAccessContext = createContext(false);

/** False until the current tenant's scopes are known to lack write access. */
export const useReadOnlyAccess = () => useContext(ReadOnlyAccessContext);

const ReadOnlyFieldContext = createContext(false);

type ScopeProps = {
  readonly children: ReactNode;
};

/** For a read-only member, locks the inputs inside it that read {@link useReadOnlyField}. */
export function ReadOnlyFieldScope({ children }: ScopeProps) {
  const isReadOnly = useReadOnlyAccess();

  return (
    <ReadOnlyFieldContext.Provider value={isReadOnly}>{children}</ReadOnlyFieldContext.Provider>
  );
}

/**
 * Exempts the inputs inside it from an enclosing {@link ReadOnlyFieldScope}. Only for controls that
 * change what is displayed, never saved data.
 */
export function EditableFieldScope({ children }: ScopeProps) {
  return <ReadOnlyFieldContext.Provider value={false}>{children}</ReadOnlyFieldContext.Provider>;
}

/**
 * Whether an input should lock: true for a read-only member when the nearest field scope is a
 * {@link ReadOnlyFieldScope}, not an {@link EditableFieldScope}.
 */
export const useReadOnlyField = () => useContext(ReadOnlyFieldContext);
