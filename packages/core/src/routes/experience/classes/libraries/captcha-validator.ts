import { CaptchaType, type CaptchaProvider } from '@logto/schemas';
import ky from 'ky';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';

export class CaptchaValidator {
  constructor(private readonly captchaProvider: CaptchaProvider) {}

  public async verifyCaptcha(captchaToken: string): Promise<boolean> {
    const {
      config: { type, secretKey },
    } = this.captchaProvider;

    switch (type) {
      case CaptchaType.Turnstile: {
        return this.verifyTurnstile(secretKey, captchaToken);
      }

      default: {
        throw new RequestError({ code: 'session.captcha_failed', status: 422 });
      }
    }
  }

  private async verifyTurnstile(secretKey: string, captchaToken: string) {
    try {
      const result = await ky
        .post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ secret: secretKey, response: captchaToken }),
        })
        .json();

      const responseGuard = z.object({
        success: z.boolean(),
        'error-codes': z.array(z.string()).optional(),
      });

      const response = responseGuard.parse(result);

      return response.success;
    } catch {
      return false;
    }
  }
}
