import { appendPath } from '@silverhand/essentials';

import { logtoUrl } from '#src/constants.js';

import ExpectPage from './expect-page.js';

const demoAppUrl = appendPath(new URL(logtoUrl), 'demo-app');

/** Remove the query string together with the `?` from a URL string. */
const stripQuery = (url: string) => url.split('?')[0];

export type JourneyPath = 'sign-in' | 'register' | 'register/password' | 'register/verify';

/**
 * A class that provides:
 *
 * - A set of methods to navigate to a specific page for a journey.
 * - A set of methods to assert the state of a journey and its side effects.
 */
export default class ExpectJourney extends ExpectPage {
  constructor(
    thePage = global.page,
    public readonly journeyEndpoint = new URL(logtoUrl)
  ) {
    super(thePage);
  }

  async startWith(initialUrl = demoAppUrl, path: 'sign-in' | 'register' = 'sign-in') {
    await this.toStart(initialUrl);
    this.toBeAt('sign-in');

    if (path === 'register') {
      await this.toClick('a', 'Create account');
      this.toBeAt('register');
    }
  }

  toBeAt(mode: JourneyPath) {
    const stripped = stripQuery(this.page.url());
    expect(stripped).toBe(this.buildJourneyUrl(mode).href);
  }

  async toFillPasswords(
    ...passwords: Array<string | [password: string, errorMessage: string | RegExp]>
  ) {
    for (const element of passwords) {
      const [password, errorMessage] = Array.isArray(element) ? element : [element, undefined];

      // eslint-disable-next-line no-await-in-loop
      await this.toFillForm(
        {
          newPassword: password,
          confirmPassword: password,
        },
        { submit: true, shouldNavigate: errorMessage === undefined }
      );

      if (errorMessage === undefined) {
        break;
      } else {
        // Reject the password and assert the error message
        this.toBeAt('register/password');
        // eslint-disable-next-line no-await-in-loop
        await this.toMatchAlert(
          typeof errorMessage === 'string' ? new RegExp(errorMessage, 'i') : errorMessage
        );
      }
    }
  }

  /** Build a full journey URL from a pathname. */
  protected buildJourneyUrl(pathname = '') {
    return appendPath(this.journeyEndpoint, pathname);
  }
}
