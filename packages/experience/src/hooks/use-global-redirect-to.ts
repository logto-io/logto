import { noop } from '@react-spring/shared';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { confirmRedirectPolicyKey } from '@/shared/utils/search-parameters';

/** The route of the "Continue to app" page that holds the redirect for `confirm_redirect_policy`. */
export const continueToAppPath = 'continue-to-app';

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
   * Whether the `confirm_redirect_policy` sign-in parameter may hold this redirect on the "Continue to
   * app" page. Defaults to `true`.
   * Set to `false` for the redirect from the "Continue to app" page itself.
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

  const redirectTo = useCallback(
    async (url: string | URL): Promise<never> => {
      /**
       * Hold the final sign-in redirect on the "Continue to app" page when the client asks for it
       * with `confirm_redirect_policy` (see `ExtraParamsKey.ConfirmRedirectPolicy`). It works around iOS
       * `ASWebAuthenticationSession`, which closes on the callback URL and dismisses the "Save
       * Password" prompt. The page redirects through this hook once the user taps "Continue".
       */
      const policy = sessionStorage.getItem(confirmRedirectPolicyKey);
      const shouldConfirmRedirect =
        canConfirmRedirect &&
        shouldClearInteractionContextSession &&
        policy === 'password' &&
        hasEnteredPassword();

      if (shouldConfirmRedirect) {
        navigate(`/${continueToAppPath}`, { replace: true, state: { redirectTo: url.toString() } });
      } else {
        // Set the global loading state to prevent further user interaction during the redirect
        setLoading(true);

        // The identifier cache is session-isolated, so clear it once the interaction is submitted
        if (shouldClearInteractionContextSession) {
          clearInteractionContextSessionStorage();
        }

        // Synchronous, and unloads the current page right away
        if (isReplace) {
          window.location.replace(url);
        } else {
          window.location.assign(url);
        }
      }

      // Never resolve, so the caller keeps its loading state until the page leaves or switches to
      // the "Continue to app" page
      return new Promise<never>(noop);
    },
    [
      canConfirmRedirect,
      clearInteractionContextSessionStorage,
      hasEnteredPassword,
      isReplace,
      navigate,
      setLoading,
      shouldClearInteractionContextSession,
    ]
  );

  return redirectTo;
}

export default useGlobalRedirectTo;
