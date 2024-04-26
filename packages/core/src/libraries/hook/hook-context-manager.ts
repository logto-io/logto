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
    const existingContext = this.contextArray.find((ctx) => ctx.event === event);

    // Merge with the existing context if event is the same
    if (existingContext) {
      this.contextArray = this.contextArray.map((currentContext) => {
        if (currentContext.event === event) {
          return {
            ...currentContext,
            data: {
              ...currentContext.data,
              ...data,
            },
          };
        }

        return currentContext;
      });
    }

    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.contextArray.push({ event, data });
  }
}

// TODO: migrate the current interaction hook context using hook context manager
