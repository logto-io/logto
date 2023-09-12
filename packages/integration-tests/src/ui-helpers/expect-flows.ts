import { appendPath } from '@silverhand/essentials';

import { logtoUrl } from '#src/constants.js';
import { readVerificationCode } from '#src/helpers/index.js';

import ExpectPage from './expect-page.js';

const demoAppUrl = appendPath(new URL(logtoUrl), 'demo-app');

/** Remove the query string together with the `?` from a URL string. */
const stripQuery = (url: string) => url.split('?')[0];

export type FlowsType = 'sign-in' | 'register' | 'continue' | 'forgot-password';

export type FlowsPath =
  | FlowsType
  | `${FlowsType}/password`
  | `${FlowsType}/verify`
  | `${FlowsType}/verification-code`
  | `forgot-password/reset`;

export type ExpectFlowsOptions = {
  /** The URL of the flows endpoint. */
  endpoint?: URL;
  /**
   * Whether the forgot password flow is enabled.
   *
   * @default false
   */
  forgotPassword?: boolean;
};

type OngoingFlows = {
  type: FlowsType;
  initialUrl: URL;
};

/**
 * A class that provides:
 *
 * - A set of methods to navigate to a specific page for a flows.
 * - A set of methods to assert the state of a flows and its side effects.
 */
export default class ExpectFlows extends ExpectPage {
  readonly options: Required<ExpectFlowsOptions>;

  protected get flowsType() {
    if (this.#ongoing === undefined) {
      return this.throwNoOngoingFlowsError();
    }
    return this.#ongoing.type;
  }

  #ongoing?: OngoingFlows;

  constructor(thePage = global.page, options: ExpectFlowsOptions = {}) {
    super(thePage);
    this.options = {
      endpoint: new URL(logtoUrl),
      forgotPassword: false,
      ...options,
    };
  }

  /**
   * Start flows with the given initial URL. Expect the initial URL is protected by Logto, and
   * navigate to the flows sign-in page if unauthenticated.
   *
   * If the flows can be started, the instance will be marked as ongoing.
   *
   * @param initialUrl The initial URL to start the flows with.
   * @param type The type of flows to expect. If it's `register`, it will try to click the "Create
   * account" link on the sign-in page.
   */
  async startWith(initialUrl = demoAppUrl, type: FlowsType = 'sign-in') {
    await this.toStart(initialUrl);
    this.toBeAt('sign-in');

    if (type === 'register') {
      await this.toClick('a', 'Create account');
      this.toBeAt('register');
    }

    this.#ongoing = { type, initialUrl };
  }

  /**
   * Ensure the flows is ongoing and the page is at the initial URL; then try to click the "sign out"
   * button (case-insensitive) and close the page.
   *
   * It will clear the ongoing flows if the flows is ended successfully.
   */
  async verifyThenEnd() {
    if (this.#ongoing === undefined) {
      return this.throwNoOngoingFlowsError();
    }

    this.toMatchUrl(this.#ongoing.initialUrl);
    await this.toClick('div[role=button]', /sign out/i);

    this.#ongoing = undefined;
    await this.page.close();
  }

  /**
   * Assert the page is at the given flows path.
   *
   * @param pathname The flows path to assert.
   */
  toBeAt(pathname: FlowsPath) {
    const stripped = stripQuery(this.page.url());
    expect(stripped).toBe(this.buildFlowsUrl(pathname).href);
  }

  /**
   * Assert the page is at the verification code page and fill the verification code input with the
   * code from Logto database.
   *
   * @param type The type of flows to expect.
   */
  async toCompleteVerification(type: FlowsType) {
    this.toBeAt(`${type}/verification-code`);
    const { code } = await readVerificationCode();

    for (const [index, char] of code.split('').entries()) {
      // eslint-disable-next-line no-await-in-loop
      await this.toFillInput(`passcode_${index}`, char);
    }
  }

  /**
   * Fill the password inputs with the given passwords. If the password is an array, the second
   * element will be used to assert the error message; otherwise, the password is expected to be
   * valid and the form will be submitted.
   *
   * @param passwords The passwords to fill.
   * @example
   *
   * In the following example, the first password is expected to be rejected with the error message
   * "simple password" (case-insensitive), and the second password is expected to be accepted.
   *
   * ```ts
   * await journey.toFillPasswords(
   *  [credentials.pwnedPassword, 'simple password'],
   *  credentials.password,
   * );
   * ```
   */
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

  /** Build a full flows URL from a pathname. */
  protected buildFlowsUrl(pathname = '') {
    return appendPath(this.options.endpoint, pathname);
  }

  protected throwNoOngoingFlowsError() {
    return this.throwError('The flows has not started yet. Use `startWith` to start the flows.');
  }
}
