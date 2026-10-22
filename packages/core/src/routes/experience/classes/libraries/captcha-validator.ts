import { createHmac } from 'node:crypto';

import {
  type CapConfig,
  CaptchaType,
  type GeetestConfig,
  RecaptchaEnterpriseMode,
  type CaptchaProvider,
  type RecaptchaEnterpriseConfig,
  type TurnstileConfig,
} from '@logto/schemas';
import ky from 'ky';
import { z } from 'zod';

import { type LogEntry } from '#src/middleware/koa-audit-log.js';
import { ssrfProtectedFetch } from '#src/utils/outbound-request.js';

const DEFAULT_SCORE_THRESHOLD = 0.5;

/**
 * The validation result returned by GeeTest CAPTCHA v4 on the client side.
 *
 * @see https://docs.geetest.com/BehaviorVerification/apirefer/api/web#getvalidate
 */
const geetestValidateGuard = z.object({
  lot_number: z.string(),
  captcha_output: z.string(),
  pass_token: z.string(),
  gen_time: z.string(),
});

function isRecaptchaEnterprise(
  config: CaptchaProvider['config']
): config is RecaptchaEnterpriseConfig {
  return config.type === CaptchaType.RecaptchaEnterprise;
}

function isCap(config: CaptchaProvider['config']): config is CapConfig {
  return config.type === CaptchaType.Cap;
}

function isGeetest(config: CaptchaProvider['config']): config is GeetestConfig {
  return config.type === CaptchaType.Geetest;
}

function isTurnstile(config: CaptchaProvider['config']): config is TurnstileConfig {
  return config.type === CaptchaType.Turnstile;
}

type ScorePassParams = {
  valid: boolean;
  score: number;
  mode?: RecaptchaEnterpriseMode;
  scoreThreshold?: number;
};

/**
 * Decide whether a reCAPTCHA Enterprise assessment passes.
 * Checkbox challenges are interactive and provide binary pass/fail, so the score
 * threshold is skipped in checkbox mode.
 */
export const isScorePass = ({ valid, score, mode, scoreThreshold }: ScorePassParams) =>
  mode === RecaptchaEnterpriseMode.Checkbox
    ? valid
    : valid && score >= (scoreThreshold ?? DEFAULT_SCORE_THRESHOLD);

export class CaptchaValidator {
  constructor(
    private readonly captchaProvider: CaptchaProvider,
    private readonly log: LogEntry
  ) {}

  public async verifyCaptcha(captchaToken: string): Promise<boolean> {
    const { config } = this.captchaProvider;

    if (isRecaptchaEnterprise(config)) {
      return this.verifyRecaptchaEnterprise(config, captchaToken);
    }

    if (isTurnstile(config)) {
      return this.verifyTurnstile(config, captchaToken);
    }

    if (isCap(config)) {
      return this.verifyCap(config, captchaToken);
    }

    if (isGeetest(config)) {
      return this.verifyGeetest(config, captchaToken);
    }

    throw new Error('Invalid captcha provider');
  }

  private async verifyTurnstile(config: TurnstileConfig, captchaToken: string) {
    try {
      const result = await ky
        .post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: config.secretKey,
            response: captchaToken,
          }),
        })
        .json();

      const responseGuard = z.object({
        success: z.boolean(),
        'error-codes': z.array(z.string()).optional(),
      });

      const response = responseGuard.parse(result);

      this.log.append({
        success: response.success,
        errorMessage: response['error-codes']?.join(', '),
      });

      return response.success;
    } catch {
      this.log.append({
        success: false,
        errorMessage: 'Failed to get the result from Cloudflare Turnstile',
      });

      return false;
    }
  }

  /**
   * Verify the token against the GeeTest CAPTCHA v4 secondary validation API.
   *
   * The client sends the four fields returned by `getValidate()` as a JSON string to keep the
   * public `captchaToken` contract unchanged.
   *
   * @see https://docs.geetest.com/BehaviorVerification/deploy/server/node
   */
  private async verifyGeetest(config: GeetestConfig, captchaToken: string) {
    try {
      const validate = geetestValidateGuard.parse(JSON.parse(captchaToken));
      const signToken = createHmac('sha256', config.secretKey)
        .update(validate.lot_number)
        .digest('hex');

      const result = await ky
        .post(
          `https://gcaptcha4.geetest.com/validate?captcha_id=${encodeURIComponent(config.siteKey)}`,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              lot_number: validate.lot_number,
              captcha_output: validate.captcha_output,
              pass_token: validate.pass_token,
              gen_time: validate.gen_time,
              sign_token: signToken,
            }),
            retry: 0,
            timeout: 10_000,
            // Keep the outbound call on the same guarded fetch path as other captcha providers.
            fetch: ssrfProtectedFetch,
          }
        )
        .json();

      const responseGuard = z.object({
        result: z.string(),
        reason: z.string().optional(),
      });
      const response = responseGuard.parse(result);
      const success = response.result === 'success';

      this.log.append({
        success,
        errorMessage: success ? undefined : response.reason,
      });

      return success;
    } catch {
      this.log.append({
        success: false,
        errorMessage: 'Failed to get the result from GeeTest',
      });

      return false;
    }
  }

  /**
   * Verify the token against the tenant's self-hosted Cap Standalone instance.
   *
   * @see https://capjs.js.org/guide/standalone/#server-side
   */
  private async verifyCap(config: CapConfig, captchaToken: string) {
    try {
      const url = `${config.endpoint.replace(/\/+$/, '')}/${encodeURIComponent(
        config.siteKey
      )}/siteverify`;

      const result = await ky
        .post(url, {
          json: { secret: config.secretKey, response: captchaToken },
          // Cap responds with a 4xx status and an error message for invalid or expired tokens.
          throwHttpErrors: false,
          retry: 0,
          timeout: 10_000,
          // The endpoint is tenant-supplied; keep the request off the deployment's private network.
          fetch: ssrfProtectedFetch,
        })
        .json();

      const responseGuard = z.object({
        success: z.boolean(),
        error: z.string().optional(),
      });

      const response = responseGuard.parse(result);

      this.log.append({
        success: response.success,
        errorMessage: response.error,
      });

      return response.success;
    } catch {
      this.log.append({
        success: false,
        errorMessage: 'Failed to get the result from Cap',
      });

      return false;
    }
  }

  private async verifyRecaptchaEnterprise(config: RecaptchaEnterpriseConfig, captchaToken: string) {
    try {
      const result = await ky
        .post(
          `https://recaptchaenterprise.googleapis.com/v1/projects/${config.projectId}/assessments?key=${config.secretKey}`,
          {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: {
                token: captchaToken,
                siteKey: config.siteKey,
                // We can't decide the action here, because the interaction event may change after the user interaction.
                // So we use a fixed action here.
                expectedAction: 'interaction',
              },
            }),
          }
        )
        .json();

      const responseGuard = z.object({
        tokenProperties: z.object({
          valid: z.boolean(),
        }),
        riskAnalysis: z.object({
          score: z.number(),
        }),
      });

      const {
        tokenProperties: { valid },
        riskAnalysis: { score },
      } = responseGuard.parse(result);

      const success = isScorePass({
        valid,
        score,
        mode: config.mode,
        scoreThreshold: config.scoreThreshold,
      });

      this.log.append({
        success,
        score,
        mode: config.mode ?? RecaptchaEnterpriseMode.Invisible,
      });

      return success;
    } catch {
      this.log.append({
        success: false,
        errorMessage: 'Failed to get the result from Google Recaptcha Enterprise',
      });

      return false;
    }
  }
}
