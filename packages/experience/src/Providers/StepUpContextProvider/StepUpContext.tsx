import { type InteractionAuthenticationContext } from '@logto/schemas';
import { createContext } from 'react';

export type StepUpContextType = {
  /**
   * The authentication context the server computed for this interaction: the selected class,
   * the methods that can still contribute to it, and the masked identifiers. `undefined` until
   * the first load settles, and when the interaction is gone or carries no context.
   */
  authenticationContext?: InteractionAuthenticationContext;
  /**
   * Whether a load is in flight. The landing page waits for it before dispatching, so a stale
   * context never decides where the user goes.
   */
  isLoading: boolean;
  /** Whether a load has settled at least once. */
  isLoaded: boolean;
  /** A transient load failure, cleared by a successful load or a confirmed lost session. */
  loadError?: unknown;
  /**
   * Load the authoritative context from interaction storage.
   *
   * @param shouldInitialize Whether to initialize the interaction with `PUT /experience` if
   * storage holds nothing yet (404). Only the landing page sets this.
   */
  load: (shouldInitialize?: boolean) => Promise<boolean>;
  /** Re-read the authoritative context from interaction storage. */
  refetch: () => Promise<void>;
};

export default createContext<StepUpContextType>({
  authenticationContext: undefined,
  isLoading: false,
  isLoaded: false,
  load: async () => false,
  refetch: async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- the default no-op must resolve to a promise
    return undefined;
  },
});
