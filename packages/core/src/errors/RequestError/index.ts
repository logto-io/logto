import { LogtoErrorCode, LogtoErrorI18nKey } from '@logto/phrases';
import { RequestErrorBody, RequestErrorMetadata, UserLogDBEntry } from '@logto/schemas';
import i18next from 'i18next';
import pick from 'lodash.pick';

import { OmitAutoSetFields } from '@/database/utils';

export default class RequestError extends Error {
  code: LogtoErrorCode;
  status: number;
  expose: boolean;
  data: unknown;

  constructor(input: RequestErrorMetadata | LogtoErrorCode, data?: unknown) {
    const {
      code,
      status = 400,
      ...interpolation
    } = typeof input === 'string' ? { code: input } : input;
    const message = i18next.t<string, LogtoErrorI18nKey>(`errors:${code}`, interpolation);

    super(message);

    this.expose = true;
    this.code = code;
    this.status = status;
    this.data = data;
  }

  get body(): RequestErrorBody {
    return pick(this, 'message', 'code', 'data');
  }
}

export class RequestErrorWithUserLog extends RequestError {
  payload: OmitAutoSetFields<UserLogDBEntry>;

  constructor(
    input: RequestErrorMetadata | LogtoErrorCode,
    payload: OmitAutoSetFields<UserLogDBEntry>,
    data?: unknown
  ) {
    super(input, data);
    this.payload = payload;
  }
}
