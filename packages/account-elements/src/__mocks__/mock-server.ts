import { type RequestHandler } from 'msw';
import { setupWorker } from 'msw/browser';

export const createMockServer = (...handlers: RequestHandler[]) => {
  const worker = setupWorker(...handlers);

  return {
    start: async () => worker.start({ quiet: true }),
    stop: () => {
      worker.stop();
    },
  };
};
