import { appendPath } from '@silverhand/essentials';

import { logtoUrl } from '#src/constants.js';
import { readVerificationCode } from '#src/helpers/index.js';

import ExpectPage from './expect-page.js';

const demoAppUrl = appendPath(new URL(logtoUrl), 'demo-app');

/** Remove the query string together with the `?` from a URL string. */
const stripQuery = (url: string) => url.split('?')[0];

export type ExperienceType = 'sign-in' | 'register' | 'continue' | 'forgot-password';

export type ExperiencePath =
  | ExperienceType
  | `${ExperienceType}/password`
  | `${ExperienceType}/verify`
  | `${ExperienceType}/verification-code`
  | `forgot-password/reset`;

export type ExpectExperienceOptions = {
  /** The URL of the experience endpoint. */
  endpoint?: URL;
  /**
   * Whether the forgot password flow is enabled.
   *
   * @default false
   */
  forgotPassword?: boolean;
};

type OngoingExperience = {
  type: ExperienceType;
  initialUrl: URL;
};

/**
 * A class that provides:
 *
 * - A set of methods to navigate to a specific page for a experience.
 * - A set of methods to assert the state of a experience and its side effects.
 */
export default class ExpectExperience extends ExpectPage {
  readonly options: Required<ExpectExperienceOptions>;

  protected get experienceType() {
    if (this.#ongoing === undefined) {
      return this.throwNoOngoingExperienceError();
    }
    return this.#ongoing.type;
  }

  #ongoing?: OngoingExperience;

  constructor(thePage = global.page, options: ExpectExperienceOptions = {}) {
    super(thePage);
    this.options = {
      endpoint: new URL(logtoUrl),
      forgotPassword: false,
      ...options,
    };
  }

  /**
   * Start experience with the given initial URL. Expect the initial URL is protected by Logto, and
   * navigate to the experience sign-in page if unauthenticated.
   *
   * If the experience can be started, the instance will be marked as ongoing.
   *
   * @param initialUrl The initial URL to start the experience with.
   * @param type The type of experience to expect. If it's `register`, it will try to click the "Create
   * account" link on the sign-in page.
   */
  async startWith(initialUrl = demoAppUrl, type: ExperienceType = 'sign-in') {
    await this.toStart(initialUrl);
    this.toBeAt('sign-in');

    if (type === 'register') {
      await this.toClick('a', 'Create account');
      this.toBeAt('register');
    }

    this.#ongoing = { type, initialUrl };
  }

  /**
   * Ensure the experience is ongoing and the page is at the initial URL; then try to click the "sign out"
   * button (case-insensitive) and close the page.
   *
   * It will clear the ongoing experience if the experience is ended successfully.
   */
  async verifyThenEnd() {
    if (this.#ongoing === undefined) {
      return this.throwNoOngoingExperienceError();
    }

    this.toMatchUrl(this.#ongoing.initialUrl);
    await this.toClick('div[role=button]', /sign out/i);

    this.#ongoing = undefined;
    await this.page.close();
  }

  /**
   * Assert the page is at the given experience path.
   *
   * @param pathname The experience path to assert.
   */
  toBeAt(pathname: ExperiencePath) {
    const stripped = stripQuery(this.page.url());
    expect(stripped).toBe(this.buildExperienceUrl(pathname).href);
  }

  /**
   * Assert the page is at the verification code page and fill the verification code inputs with the
   * code from Logto database.
   *
   * @param type The type of experience to expect.
   */
  async toCompleteVerification(type: ExperienceType) {
    this.toBeAt(`${type}/verification-code`);
    const { code } = await readVerificationCode();
    await this.toFillVerificationCode(code);
  }

  /**
   * Fill the verification code inputs with the given code.
   *
   * @param code The verification code to fill.
   */
  async toFillVerificationCode(code: string) {
    for (const [index, char] of code.split('').entries()) {
      // eslint-disable-next-line no-await-in-loop
      await this.toFillInput(`passcode_${index}`, char);
    }
  }

  /**
   * Fill the password form inputs with the given passwords. If forgot password flow is enabled,
   * only the `newPassword` input will be filled; otherwise, both `newPassword` and `confirmPassword`
   * will be filled.
   *
   * @param passwords The passwords to fill.
   * @see {@link toFillPasswordsToInputs} for filling passwords to specific named inputs.
   */
  async toFillNewPasswords(
    ...passwords: Array<string | [password: string, errorMessage: string | RegExp]>
  ) {
    return this.toFillPasswordsToInputs(
      {
        inputNames: this.options.forgotPassword
          ? ['newPassword']
          : ['newPassword', 'confirmPassword'],
      },
      ...passwords
    );
  }

  /**
   * Fill the password form inputs with the given passwords. If the password is an array,
   * the second element will be used to assert the error message; otherwise, the password is
   * expected to be valid and the form will be submitted.
   *
   * @param inputNames The names of the password form inputs.
   * @param passwords The passwords to fill.
   * @example
   *
   * In the following example, the first password is expected to be rejected with the error message
   * "simple password" (case-insensitive), and the second password is expected to be accepted.
   *
   * ```ts
   * await experience.toFillPasswords(
   *  [credentials.pwnedPassword, 'simple password'],
   *  credentials.password,
   * );
   * ```
   */
  async toFillPasswordsToInputs(
    { inputNames, shouldNavigate = true }: { inputNames: string[]; shouldNavigate?: boolean },
    ...passwords: Array<string | [password: string, errorMessage: string | RegExp]>
  ) {
    for (const element of passwords) {
      const [password, errorMessage] = Array.isArray(element) ? element : [element, undefined];

      // eslint-disable-next-line no-await-in-loop
      await this.toFillForm(Object.fromEntries(inputNames.map((name) => [name, password])), {
        submit: true,
        shouldNavigate: shouldNavigate && errorMessage === undefined,
      });

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

  /**
   * Expect a toast to appear with the given text, then remove it immediately.
   *
   * @param text The text to match.
   */
  async waitForToast(text: string | RegExp) {
    return this.toMatchAndRemove('div[role=toast]', text);
  }

  /** Build a full experience URL from a pathname. */
  protected buildExperienceUrl(pathname = '') {
    return appendPath(this.options.endpoint, pathname);
  }

  protected throwNoOngoingExperienceError() {
    return this.throwError(
      'The experience has not started yet. Use `startWith` to start the experience.'
    );
  }
}
