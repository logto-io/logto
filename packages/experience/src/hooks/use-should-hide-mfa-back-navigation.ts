import useMfaFlowState from '@/hooks/use-mfa-factors-state';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';

/**
 * Hide the MFA setup back button when the user signed in via a one-time token.
 * Going back would re-run token verification and fail with `one_time_token.token_consumed`.
 */
const useShouldHideMfaBackNavigation = () => {
  const flowState = useMfaFlowState();
  const { get } = useSessionStorage();

  return Boolean(flowState?.hideBack || get(StorageKeys.OneTimeTokenSignIn));
};

export default useShouldHideMfaBackNavigation;
