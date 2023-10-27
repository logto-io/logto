import { authenticator } from 'otplib';

import { waitFor, dcls } from '#src/utils.js';

import ExpectMfaExperience from './expect-mfa-experience.js';

export default class ExpectTotpExperience extends ExpectMfaExperience {
  constructor(thePage = global.page) {
    super(thePage);
  }

  /**
   * Assert the page is at the TOTP binding page and fill the TOTP code
   * generated from the TOTP secret.
   *
   * @param [signingInAfterBinding=true] Whether the flow will continue to sign in after the binding.
   * @returns The binding TOTP secret.
   */
  async toBindTotp(signingInAfterBinding = true) {
    // Wait for the page to load
    await waitFor(500);

    this.toBeAt('mfa-binding/Totp');
    // Expect the QR code rendered
    await expect(this.page).toMatchElement(`${dcls('qrCode')} img[src*="data:image"]`);

    // Wait for 500ms, otherwise the click on the "Can't scan the QR code?" link will not work
    await waitFor(500);
    await this.toClick('a', 'Can’t scan the QR code?', false);

    const secretDiv = await expect(this.page).toMatchElement(dcls('rawSecret'));

    const secret = (await secretDiv.evaluate((element) => element.textContent)) ?? '';

    const code = authenticator.generate(secret);

    await this.fillTotpCode(code);

    // Wait for the form to commit automatically
    await waitFor(500);
    if (signingInAfterBinding) {
      await this.page.waitForSelector('img[alt="Congrats"]');
    }

    return secret;
  }

  /**
   * Assert the page is at the TOTP verification page and fill the TOTP code
   * generated from the TOTP secret.
   *
   * @param secret The TOTP secret.
   * @param [signingInAfterVerification=true] Whether the flow will continue to sign in after the verification.
   */
  async toVerifyTotp(secret: string, signingInAfterVerification = true) {
    // Wait for the page to load
    await waitFor(500);

    this.toBeAt('mfa-verification/Totp');

    const code = authenticator.generate(secret);

    await this.fillTotpCode(code);

    // Wait for the form to commit automatically
    await waitFor(500);
    if (signingInAfterVerification) {
      await this.page.waitForSelector('img[alt="Congrats"]');
    }
  }

  private async fillTotpCode(code: string) {
    for (const [index, char] of code.split('').entries()) {
      // eslint-disable-next-line no-await-in-loop
      await this.toFillInput(`totpCode_${index}`, char);
    }
  }
}
