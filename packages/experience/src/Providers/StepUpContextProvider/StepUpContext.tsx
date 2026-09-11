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
  /** Re-read the authoritative context from interaction storage. */
  refetch: () => Promise<void>;
};

export default createContext<StepUpContextType>({
  authenticationContext: undefined,
  isLoading: true,
  refetch: async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  },
});
