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
    this.toBeAt('mfa-binding/WebAuthn');
    // Wait for the WebAuthn options have been prepared.
    await this.page.waitForNetworkIdle();
    await this.toClick('button', 'Create a passkey');
  }

  async toVerifyViaPasskey() {
    this.toBeAt('mfa-verification/WebAuthn');
    // Wait for the WebAuthn options have been prepared.
    await this.page.waitForNetworkIdle();
    await this.toClick('button', 'Verify via passkey');
  }

  private async getCdpClient() {
    this._cdpClient ||= await this.page.target().createCDPSession();
    return this._cdpClient;
  }
}
