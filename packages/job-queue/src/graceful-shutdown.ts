import { type ConsoleLog } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';

import { withTimeout } from './promise.js';

export const defaultShutdownSignals = ['SIGINT', 'SIGQUIT', 'SIGTERM'] as const;

export type SignalTarget = Pick<typeof process, 'listeners' | 'off' | 'once'>;
// `process.listeners()` narrows the listener to the exact signal since `@types/node` 26, which is
// not assignable to the deprecated `NodeJS.SignalsListener`. Use the runtime listener shape.
export type SignalListener = ReturnType<typeof process.listeners>[number];

export type GracefulShutdownOptions = {
  signals?: readonly NodeJS.Signals[];
  /** Listeners to leave in place; every other listener on `signals` is replaced by the handler. */
  keep?: ReadonlyMap<NodeJS.Signals, readonly SignalListener[]>;
  /** Resolves once in-flight queue/enqueue work has settled. */
  drain: () => Promise<unknown>;
  drainTimeoutMs: number;
  /** Optional hook awaited when `drain()` exceeds `drainTimeoutMs`, before `cleanup`. */
  onDrainTimeout?: () => Promise<unknown>;
  /** Closes HTTP servers or listeners; runs concurrently with `drain`. */
  close: () => Promise<unknown>;
  /** Optional final resource cleanup (e.g. closing database pools) after `drain` and `close`. */
  cleanup?: () => Promise<unknown>;
  exit?: (code: number) => void;
  log: Pick<ConsoleLog, 'info' | 'warn'>;
  target?: SignalTarget;
};

const defaultExit = (code: number): void => {
  // eslint-disable-next-line unicorn/no-process-exit -- graceful shutdown terminates the process after cleanup
  process.exit(code);
};

class GracefulShutdownCoordinator {
  private shuttingDown = false;

  constructor(private readonly options: GracefulShutdownOptions) {}

  install(): void {
    const {
      signals = defaultShutdownSignals,
      keep = new Map<NodeJS.Signals, readonly SignalListener[]>(),
      target = process,
    } = this.options;

    for (const signal of signals) {
      for (const existingListener of target.listeners(signal)) {
        if (!keep.get(signal)?.includes(existingListener)) {
          target.off(signal, existingListener);
        }
      }
      target.once(signal, this.handleSignalListener);
    }
  }

  private readonly handleSignalListener = (signal: NodeJS.Signals) => {
    void this.handleSignal(signal);
  };

  private async handleSignal(signal: NodeJS.Signals): Promise<void> {
    if (this.shuttingDown) {
      return;
    }

    this.shuttingDown = true;

    const {
      signals = defaultShutdownSignals,
      drain,
      drainTimeoutMs,
      onDrainTimeout,
      close,
      cleanup,
      exit = defaultExit,
      log,
      target = process,
    } = this.options;

    for (const registeredSignal of signals) {
      target.off(registeredSignal, this.handleSignalListener);
    }

    const drainTimeoutMessage = `Job queue drain timed out after ${drainTimeoutMs} ms; remaining claimed jobs will be released.`;
    log.info(`Received ${signal}; draining job queue before exit.`);

    await Promise.all([
      this.drainWithTimeout({ drain, drainTimeoutMs, drainTimeoutMessage, onDrainTimeout, log }),
      trySafe(close()),
    ]);

    if (cleanup) {
      await trySafe(cleanup());
    }

    exit(0);
  }

  private async drainWithTimeout({
    drain,
    drainTimeoutMs,
    drainTimeoutMessage,
    onDrainTimeout,
    log,
  }: {
    drain: () => Promise<unknown>;
    drainTimeoutMs: number;
    drainTimeoutMessage: string;
    onDrainTimeout: GracefulShutdownOptions['onDrainTimeout'];
    log: Pick<ConsoleLog, 'info' | 'warn'>;
  }): Promise<void> {
    const outcome = await trySafe(
      async () => {
        await withTimeout(drain(), drainTimeoutMs, drainTimeoutMessage);
        log.info('Job queue drained.');
        return true;
      },
      () => {
        log.warn(drainTimeoutMessage);
      }
    );

    if (!outcome && onDrainTimeout) {
      await trySafe(onDrainTimeout());
    }
  }
}

/**
 * Install process-wide graceful shutdown handlers on `signals` (default `SIGINT`, `SIGQUIT`,
 * `SIGTERM`).
 *
 * Drains the job queue (bounded by `drainTimeoutMs`) concurrently with `close()`, invokes
 * `onDrainTimeout` if the drain budget expires, runs optional `cleanup()` (e.g. closing DB pools),
 * and exits with `0`. Only the first signal is intercepted; subsequent signals fall through to the
 * runtime's default behavior.
 */
export const installGracefulShutdown = (options: GracefulShutdownOptions): void => {
  new GracefulShutdownCoordinator(options).install();
};
