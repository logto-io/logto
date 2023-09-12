import { appendPath } from '@silverhand/essentials';

import { logtoUrl } from '#src/constants.js';
import { readVerificationCode } from '#src/helpers/index.js';

import ExpectPage from './expect-page.js';

const demoAppUrl = appendPath(new URL(logtoUrl), 'demo-app');

/** Remove the query string together with the `?` from a URL string. */
const stripQuery = (url: string) => url.split('?')[0];

export type JourneyType = 'sign-in' | 'register' | 'continue' | 'forgot-password';

export type JourneyPath =
  | JourneyType
  | `${JourneyType}/password`
  | `${JourneyType}/verify`
  | `${JourneyType}/verification-code`
  | `forgot-password/reset`;

export type ExpectJourneyOptions = {
  /** The URL of the journey endpoint. */
  endpoint?: URL;
  /**
   * Whether the forgot password flow is enabled.
   *
   * @default false
   */
  forgotPassword?: boolean;
};

type OngoingJourney = {
  type: JourneyType;
  initialUrl: URL;
};

/**
 * A class that provides:
 *
 * - A set of methods to navigate to a specific page for a journey.
 * - A set of methods to assert the state of a journey and its side effects.
 */
export default class ExpectJourney extends ExpectPage {
  readonly options: Required<ExpectJourneyOptions>;

  protected get journeyType() {
    if (this.#ongoing === undefined) {
      return this.throwNoOngoingJourneyError();
    }
    return this.#ongoing.type;
  }

  #ongoing?: OngoingJourney;

  constructor(thePage = global.page, options: ExpectJourneyOptions = {}) {
    super(thePage);
    this.options = {
      endpoint: new URL(logtoUrl),
      forgotPassword: false,
      ...options,
    };
  }

  async startWith(initialUrl = demoAppUrl, type: JourneyType = 'sign-in') {
    await this.toStart(initialUrl);
    this.toBeAt('sign-in');

    if (type === 'register') {
      await this.toClick('a', 'Create account');
      this.toBeAt('register');
    }

    this.#ongoing = { type, initialUrl };
  }

  async verifyThenEnd() {
    if (this.#ongoing === undefined) {
      return this.throwNoOngoingJourneyError();
    }

    this.toMatchUrl(this.#ongoing.initialUrl);
    await this.toClick('div[role=button]', /sign out/i);

    this.#ongoing = undefined;
    await this.page.close();
  }

  toBeAt(mode: JourneyPath) {
    const stripped = stripQuery(this.page.url());
    expect(stripped).toBe(this.buildJourneyUrl(mode).href);
  }

  async toCompleteVerification(type: JourneyType) {
    this.toBeAt(`${type}/verification-code`);
    const { code } = await readVerificationCode();

    for (const [index, char] of code.split('').entries()) {
      // eslint-disable-next-line no-await-in-loop
      await this.toFillInput(`passcode_${index}`, char);
    }
  }

  async toFillPasswords(
    ...passwords: Array<string | [password: string, errorMessage: string | RegExp]>
  ) {
    for (const element of passwords) {
      const [password, errorMessage] = Array.isArray(element) ? element : [element, undefined];

      // eslint-disable-next-line no-await-in-loop
      await this.toFillForm(
        this.options.forgotPassword
          ? { newPassword: password }
          : {
              newPassword: password,
              confirmPassword: password,
            },
        { submit: true, shouldNavigate: errorMessage === undefined }
      );

      if (errorMessage === undefined) {
        break;
      } else {
        // Reject the password and assert the error message
        // eslint-disable-next-line no-await-in-loop
        await this.toMatchAlert(
          typeof errorMessage === 'string' ? new RegExp(errorMessage, 'i') : errorMessage
        );
      }
    }
  }

  /** Build a full journey URL from a pathname. */
  protected buildJourneyUrl(pathname = '') {
    return appendPath(this.options.endpoint, pathname);
  }

  protected throwNoOngoingJourneyError() {
    return this.throwError(
      'The journey has not started yet. Use `startWith` to start the journey.'
    );
  }
}
