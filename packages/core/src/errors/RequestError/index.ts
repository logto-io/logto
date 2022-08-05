import { LogtoErrorCode, LogtoErrorI18nKey } from '@logto/phrases';
import { RequestErrorBody, RequestErrorMetadata } from '@logto/schemas';
import { conditional, Optional } from '@silverhand/essentials';
import i18next from 'i18next';
import pick from 'lodash.pick';
import { ZodError } from 'zod';

const formatZodError = ({ issues }: ZodError): string[] =>
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

  constructor(input: RequestErrorMetadata | LogtoErrorCode, data?: unknown) {
    const {
      code,
      status = 400,
      expose = true,
      ...interpolation
    } = typeof input === 'string' ? { code: input } : input;
    const message = i18next.t<string, LogtoErrorI18nKey>(`errors:${code}`, interpolation);

    super(message);

    this.expose = expose;
    this.code = code;
    this.status = status;
    this.data = data;
  }

  get body(): RequestErrorBody {
    return pick(this, 'message', 'code', 'data', 'details');
  }

  get details(): Optional<string> {
    return conditional(this.data instanceof ZodError && formatZodError(this.data).join('\n'));
  }
}
