import type { LogtoErrorCode, LogtoErrorI18nKey } from '@logto/phrases';
import type { RequestErrorBody, RequestErrorMetadata } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import { conditional, pick } from '@silverhand/essentials';
import i18next, { type i18n } from 'i18next';
import { ZodError } from 'zod';

export const formatZodError = ({ issues }: ZodError): string[] =>
  issues.map((issue) => {
    const base = `Error in key path "${issue.path.map(String).join('.')}": (${issue.code}) `;

    if (issue.code === 'invalid_type') {
      return base + `Expected ${issue.expected} but received ${issue.received}.`;
    }

    return base + issue.message;
  });

export default class RequestError extends Error {
  code: LogtoErrorCode;
  status: number;
  expose: boolean;
  data: unknown;

  readonly #i18nInterpolation: Record<string, unknown>;

  constructor(input: RequestErrorMetadata | LogtoErrorCode, data?: unknown) {
    const {
      code,
      status = 400,
      expose = true,
      ...interpolation
    } = typeof input === 'string' ? { code: input } : input;

    const message = i18next.t<string, LogtoErrorI18nKey>(`errors:${code}`, {
      ...interpolation,
      interpolation: {
        // Disable i18next escape value since it's for API response, we can show HTML tags.
        escapeValue: false,
      },
    });

    super(message);

    this.name = 'RequestError';
    this.expose = expose;
    this.code = code;
    this.status = status;
    this.data = data;
    this.#i18nInterpolation = interpolation;
  }

  get details(): Optional<string> {
    if (this.data instanceof SyntaxError) {
      return conditional(this.data.message);
    }

    return conditional(this.data instanceof ZodError && formatZodError(this.data).join('\n'));
  }

  /**
   * Parse the error body with i18n context
   */
  toBody(i18next: i18n): RequestErrorBody {
    return {
      ...pick(this, 'code', 'data', 'details'),
      message: this.#getI18nErrorMessage(i18next),
    };
  }

  #getI18nErrorMessage(i18next: i18n): string {
    return i18next.t<string, LogtoErrorI18nKey>(`errors:${this.code}`, {
      ...this.#i18nInterpolation,
      interpolation: {
        escapeValue: false,
      },
    });
  }
}
