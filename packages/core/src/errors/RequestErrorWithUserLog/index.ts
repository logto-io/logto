import { LogtoErrorCode } from '@logto/phrases';
import { RequestErrorMetadata, UserLogDBEntry } from '@logto/schemas';

import { OmitAutoSetFields } from '@/database/utils';

import RequestError from '../RequestError';

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
