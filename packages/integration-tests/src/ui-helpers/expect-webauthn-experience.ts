import { type CDPSession } from 'puppeteer';

import ExpectMfaExperience from './expect-mfa-experience.js';

export default class ExpectWebAuthnExperience extends ExpectMfaExperience {
  private authenticatorId?: string;
  private _cdpClient?: CDPSession;

  constructor(thePage = global.page) {
    super(thePage);
  }

  async setupVirtualAuthenticator() {
    if (this.authenticatorId) {
      this.throwError('Virtual authenticator already setup');
    }

    /**
     * Note: The Chrome DevTools supports emulating WebAuthn authenticators.
     * We use puppeteer to create a CDP(Chrome Devtools Protocol) session and use the CDP session to add a virtual authenticator.
     *
     * Useful links:
     * - https://developer.chrome.com/docs/devtools/webauthn
     * - https://github.com/aslushnikov/getting-started-with-cdp/blob/HEAD/README.md
     */
    const client = await this.getCdpClient();
    await client.send('WebAuthn.enable');
    const { authenticatorId } = await client.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
      },
    });

    this.authenticatorId = authenticatorId;
  }

  async clearVirtualAuthenticator() {
    if (!this.authenticatorId) {
      this.throwError('Virtual authenticator not added');
    }

    const client = await this.getCdpClient();
    await client.send('WebAuthn.removeVirtualAuthenticator', {
      authenticatorId: this.authenticatorId,
    });
  }

  async toCreatePasskey() {
    await this.waitToBeAt('mfa-binding/WebAuthn');
    await this.toClickCeremonyButton('Create a passkey');
  }

  async toVerifyViaPasskey() {
    await this.waitToBeAt('mfa-verification/WebAuthn');
    await this.toClickCeremonyButton('Verify via passkey');
  }

  /**
   * Click a WebAuthn ceremony button and wait for the ceremony and the follow-up interaction
   * requests to complete.
   *
   * The destination differs per flow (a client-side route change or a full redirect chain back
   * to the app), so completion is detected by leaving the current URL instead of by a
   * `waitForNavigation` watcher; the trailing network-idle wait lets the destination page
   * settle like the previous navigation-coupled click did.
   */
  private async toClickCeremonyButton(buttonText: string) {
    // Wait for the WebAuthn options have been prepared.
    await this.page.waitForNetworkIdle();

    const ceremonyUrl = this.page.url();
    // A click on a disabled button is silently swallowed, so wait until it is interactive.
    await this.toClick('button:not([disabled])', buttonText, false);
    await this.waitForUrlToMatch((url) => url !== ceremonyUrl, `to leave ${ceremonyUrl}`);
    await this.page.waitForNetworkIdle();
  }

  private async getCdpClient() {
    this._cdpClient ||= await this.page.target().createCDPSession();
    return this._cdpClient;
  }
}
