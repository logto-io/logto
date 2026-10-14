import { createContext, useContext, type ReactNode } from 'react';

/**
 * Read by the shared inputs. Lives apart from `ReadOnlyFieldScope`, which reads the tenant scopes,
 * so the inputs do not load the scope fetching.
 */
export const ReadOnlyFieldContext = createContext(false);

type ScopeProps = {
  readonly children: ReactNode;
};

/**
 * Exempts the inputs inside it from an enclosing `ReadOnlyFieldScope`. Only for controls that
 * change what is displayed, never saved data.
 */
export function EditableFieldScope({ children }: ScopeProps) {
  return <ReadOnlyFieldContext.Provider value={false}>{children}</ReadOnlyFieldContext.Provider>;
}

/**
 * Whether an input should lock: true for a read-only member when the nearest field scope is a
 * `ReadOnlyFieldScope`, not an {@link EditableFieldScope}.
 */
export const useReadOnlyField = () => useContext(ReadOnlyFieldContext);
