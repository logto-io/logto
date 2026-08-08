import {
  CaptchaType,
  RecaptchaEnterpriseMode,
  type CaptchaProvider,
  type RecaptchaEnterpriseConfig,
  type TurnstileConfig,
} from '@logto/schemas';
import ky from 'ky';
import { z } from 'zod';

import { type LogEntry } from '#src/middleware/koa-audit-log.js';

const DEFAULT_SCORE_THRESHOLD = 0.5;

function isRecaptchaEnterprise(
  config: CaptchaProvider['config']
): config is RecaptchaEnterpriseConfig {
  return config.type === CaptchaType.RecaptchaEnterprise;
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
