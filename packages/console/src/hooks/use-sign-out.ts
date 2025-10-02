import { useLogto } from '@logto/react';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

/**
 * A hook that returns a wrapped `signOut` function from `useLogto` with necessary cleanup logic.
 *
 * Unless you have special needs, you should always use this hook instead of `useLogto` directly.
 */
const useSignOut = () => {
  const { signOut: logtoSignOut } = useLogto();
  const postHog = usePostHog();

  const signOut = useCallback<ReturnType<typeof useLogto>['signOut']>(
    async (postSignOutRedirectUri) => {
      postHog.resetGroups(); // Not sure if this is needed, but just in case.
      postHog.reset();
      return logtoSignOut(postSignOutRedirectUri);
    },
    [logtoSignOut, postHog]
  );
  return {
    /** A wrapped version of `useLogto`'s `signOut` with necessary cleanup logic. */
    signOut,
  };
};

export default useSignOut;
