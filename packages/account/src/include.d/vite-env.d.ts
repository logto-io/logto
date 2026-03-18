// eslint-disable-next-line import/no-unassigned-import
import 'vite/client';
// eslint-disable-next-line import/no-unassigned-import
import 'vite-plugin-svgr/client';

declare global {
  interface Window {
    /** Runtime configuration injected by the Logto server into the account center HTML. */
    __logtoConfig__?: {
      /** Default phone country code (ISO 3166-1 alpha-2), e.g. "AU" for Australia. */
      defaultPhoneCountryCode?: string;
    };
  }
}
