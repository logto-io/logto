/**
 * Reads the runtime configuration injected by the Logto server into the account center HTML.
 *
 * To configure, set the `LOGTO_DEFAULT_PHONE_COUNTRY_CODE` environment variable on the server.
 * The value will be injected as `window.__logtoConfig__` at request time.
 */
export const getRuntimeConfig = () => {
  return window.__logtoConfig__ ?? {};
};
