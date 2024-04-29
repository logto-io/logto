import { type DataHookEvent } from '@logto/schemas';

type DataHookContext = {
  event: DataHookEvent;
  data?: Record<string, unknown>;
};

type DataHookMetadata = {
  userAgent?: string;
  ip: string;
};

export class DataHookContextManager {
  contextArray: DataHookContext[] = [];

  constructor(public metadata: DataHookMetadata) {}

  appendContext({ event, data }: DataHookContext) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.contextArray.push({ event, data });
  }
}

// TODO: @simeng-li migrate the current interaction hook context using hook context manager
