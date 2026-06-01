import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';

/**
 * Hide the MFA setup back button when the user signed in via a one-time token.
 * Going back would re-run token verification and fail with `one_time_token.token_consumed`.
 */
const useShouldHideMfaBackNavigation = () => {
  const { get } = useSessionStorage();

  return Boolean(get(StorageKeys.OneTimeTokenSignIn));
};

export default useShouldHideMfaBackNavigation;
