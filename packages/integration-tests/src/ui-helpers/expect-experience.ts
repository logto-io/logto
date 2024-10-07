import { type MfaFactor } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';

import { logtoUrl, mockSocialAuthPageUrl } from '#src/constants.js';
import { readConnectorMessage } from '#src/helpers/index.js';
import { dcls } from '#src/utils.js';

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
  | `forgot-password/reset`
  | 'mfa-binding'
  | `mfa-binding/${MfaFactor}`
  | 'mfa-verification'
  | `mfa-verification/${MfaFactor}`
  | 'identifier-sign-in'
  | 'identifier-register'
  | 'single-sign-on'
  | 'reset-password';

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

  async waitForUrl(url: URL, retry = 3) {
    // eslint-disable-next-line @silverhand/fp/no-let
    let retries = retry;

    do {
      if (this.page.url() === url.href) {
        return;
      }

      // eslint-disable-next-line no-await-in-loop
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    } while (retries--); // eslint-disable-line @silverhand/fp/no-mutation
  }

  async waitForPathname(pathname: string, retry = 3) {
    return this.waitForUrl(this.buildExperienceUrl(pathname), retry);
  }

  /**
   * Ensure the experience is ongoing and the page is at the initial URL; then try to click the "sign out"
   * button (case-insensitive) and close the page.
   *
   * It will clear the ongoing experience if the experience is ended successfully.
   */
  async verifyThenEnd(closePage = true) {
    if (this.#ongoing === undefined) {
      return this.throwNoOngoingExperienceError();
    }

    await this.waitForUrl(this.#ongoing.initialUrl);
    await this.toClick('div[role=button]', /sign out/i);

    this.#ongoing = undefined;
    if (closePage) {
      await this.page.close();
    }
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
  async toCompleteVerification(
    type: ExperienceType,
    connectorType: Parameters<typeof readConnectorMessage>['0']
  ) {
    this.toBeAt(`${type}/verification-code`);
    const { code } = await readConnectorMessage(connectorType);
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

  /**
   * Optionally click the "Continue with [social name]" button on the page, then process the social
   * sign-in flow with the given user social data.
   */
  async toProcessSocialSignIn({
    socialUserId,
    socialEmail,
    socialPhone,
    clickButton = true,
    authUrl = mockSocialAuthPageUrl,
    state: stateOverride,
  }: {
    socialUserId: string;
    socialEmail?: string;
    socialPhone?: string;
    /** Whether to click the "Continue with [social name]" button on the page. */
    clickButton?: boolean;
    /** The URL to wait for the social auth page. */
    authUrl?: string;
    /** The state parameter to override. */
    state?: string;
  }) {
    const authPageRequestListener = this.page.waitForRequest((request) =>
      request.url().startsWith(authUrl)
    );

    if (clickButton) {
      await this.toClick('button', 'Continue with Mock Social');
    }

    const result = await authPageRequestListener;

    const { searchParams: authSearchParams } = new URL(result.url());
    const redirectUri = authSearchParams.get('redirect_uri') ?? '';
    const state = stateOverride ?? authSearchParams.get('state') ?? '';

    // Mock social redirects
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('state', state);
    callbackUrl.searchParams.set('code', 'mock-code');
    callbackUrl.searchParams.set('userId', socialUserId);

    if (socialEmail) {
      callbackUrl.searchParams.set('email', socialEmail);
    }

    if (socialPhone) {
      callbackUrl.searchParams.set('phone', socialPhone);
    }

    await this.navigateTo(callbackUrl.toString());
  }

  async getUserIdFromDemoAppPage() {
    const userIdDiv = await expect(this.page).toMatchElement([dcls('infoCard'), 'div'].join(' '), {
      text: 'User ID: ',
    });
    const userIdSpan = await expect(userIdDiv).toMatchElement('span');
    return (await userIdSpan.evaluate((element) => element.textContent)) ?? '';
  }

  async findFaviconUrls() {
    const [favicon, appleFavicon] = await Promise.all([
      this.page.evaluate(() => {
        return document.querySelector('link[rel="shortcut icon"]')?.getAttribute('href');
      }),
      this.page.evaluate(() => {
        return document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href');
      }),
    ]);
    return { favicon, appleFavicon };
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
