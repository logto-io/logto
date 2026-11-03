import { noop } from '@react-spring/shared';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { continueToAppPath } from '@/pages/ContinueToApp';
import { confirmRedirectKey } from '@/shared/utils/search-parameters';

type Options = {
  /**
   * Whether to clear the interaction context session storage before redirecting.
   * Defaults to `true`.
   * Set to `false` if this redirection is not the final redirection in the sign-in process (not the sign-in successful redirection).
   */
  shouldClearInteractionContextSession?: boolean;
  /**
   * Whether to use `window.location.replace` instead of `window.location.assign` for the redirection.
   * Defaults to `true`.
   * Use `false` if this is a 3rd-party URL redirection (social sign-in or single sign-on redirection) that should be added to the browser history.
   */
  isReplace?: boolean;
  /**
   * Whether the `confirm_redirect` sign-in parameter may hold this redirect on the "Continue to
   * app" page. Defaults to `true`.
   * Set to `false` if this redirection does not complete a sign-in (e.g. aborting the interaction).
   */
  canConfirmRedirect?: boolean;
};

/**
 * Hook for global redirection to 3rd-party URLs (e.g., social sign-in, single sign-on, and the final redirection to the
 * app redirect URI after successful sign-in).
 *
 * This hook provides an async function that represents the final step in the login process.
 * It sets a global loading state, clears the interaction context (if needed), and then redirects the user.
 *
 * The returned async function will never resolve, as the page will be redirected before
 * the Promise can settle. This behavior is intentional and serves to maintain the loading
 * state on the interaction element (e.g., a button) that triggered the successful login.
 */
function useGlobalRedirectTo({
  shouldClearInteractionContextSession = true,
  isReplace = true,
  canConfirmRedirect = true,
}: Options = {}) {
  const { setLoading } = useContext(PageContext);
  const { clearInteractionContextSessionStorage, hasEnteredPassword } =
    useContext(UserInteractionContext);
  const navigate = useNavigateWithPreservedSearchParams();

  /**
   * Workaround for iOS `ASWebAuthenticationSession`: the session closes as soon as it sees the
   * app callback URL, which dismisses the system "Save Password" prompt right after it shows up,
   * and Apple provides no API to delay it. Instead of redirecting right away, show a "Continue to
   * app" page and wait for the user to tap the button (an automatic delay does not work).
   *
   * The user agent cannot tell `ASWebAuthenticationSession` from Safari, so the client opts in
   * with the `confirm_redirect` sign-in parameter (see `ExtraParamsKey.ConfirmRedirect`):
   * `password` confirms only when a password was entered in this interaction, and `always`
   * confirms for every sign-in method. It only applies to the final redirect after a sign-in.
   *
   * Remove this once Apple fixes the issue.
   *
   * @see https://github.com/auth0/react-native-auth0/issues/725
   * @see https://github.com/AzureAD/microsoft-authentication-library-for-objc/issues/848
   * @see https://curity.io/resources/learn/appauth-ios-guide/
   */
  const shouldConfirmRedirect = useCallback(() => {
    if (!canConfirmRedirect || !shouldClearInteractionContextSession) {
      return false;
    }

    const policy = sessionStorage.getItem(confirmRedirectKey);

    return policy === 'always' || (policy === 'password' && hasEnteredPassword());
  }, [canConfirmRedirect, hasEnteredPassword, shouldClearInteractionContextSession]);

  const redirectTo = useCallback(
    async (url: string | URL): Promise<never> => {
      if (shouldConfirmRedirect()) {
        clearInteractionContextSessionStorage();
        navigate(`/${continueToAppPath}`, { replace: true, state: { redirectTo: url.toString() } });

        return new Promise<never>(noop);
      }

      /**
       * Set global loading state to true
       * This prevents further user interaction during the redirect process
       */
      setLoading(true);
      /**
       * Clear all identifier input values from the storage once the interaction is submitted.
       * The Identifier cache should be session-isolated, so it should be cleared after the interaction is completed.
       */
      if (shouldClearInteractionContextSession) {
        clearInteractionContextSessionStorage();
      }
      /**
       * Perform the actual redirect
       * This is a synchronous operation and will immediately unload the current page
       */
      if (isReplace) {
        window.location.replace(url);
      } else {
        window.location.assign(url);
      }

      /**
       * Return a Promise that never resolves
       * This ensures that any async function awaiting this redirect will never continue
       * Thus maintaining the loading state on the UI until the new page is loaded
       */
      return new Promise<never>(noop);
    },
    [
      clearInteractionContextSessionStorage,
      isReplace,
      navigate,
      setLoading,
      shouldClearInteractionContextSession,
      shouldConfirmRedirect,
    ]
  );

  return redirectTo;
}

export default useGlobalRedirectTo;
