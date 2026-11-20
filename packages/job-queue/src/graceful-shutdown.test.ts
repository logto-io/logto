import EventEmitter from 'node:events';

import { noop } from '@silverhand/essentials';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { installGracefulShutdown, type SignalListener } from './graceful-shutdown.js';

const signals = ['SIGINT', 'SIGTERM'] as const;
const drainTimeoutMs = 4000;
const settled = async () => {
  // Settles at once
};
// eslint-disable-next-line unicorn/prefer-event-target -- stands in for `process`, which is an EventEmitter
const signalTarget = () => new EventEmitter() as unknown as typeof process;

const buildShutdown = ({
  drain = settled,
  onDrainTimeout,
  close = settled,
  cleanup,
  keep = new Map<NodeJS.Signals, readonly SignalListener[]>(),
}: {
  drain?: () => Promise<unknown>;
  onDrainTimeout?: () => Promise<unknown>;
  close?: () => Promise<unknown>;
  cleanup?: () => Promise<unknown>;
  keep?: ReadonlyMap<NodeJS.Signals, readonly SignalListener[]>;
} = {}) => {
  const target = signalTarget();
  const exit = vi.fn();
  const log = { info: vi.fn(), warn: vi.fn() };
  installGracefulShutdown({
    signals,
    keep,
    drain,
    drainTimeoutMs,
    onDrainTimeout,
    close,
    cleanup,
    exit,
    log,
    target,
  });

  return { target, exit, log };
};

describe('installGracefulShutdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs cleanup and exits 0 once after both drain and server close settle', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const closing = Promise.withResolvers<void>();
    const order = new Set<string>();
    const drain = vi.fn(async () => {
      order.add('drain');
    });
    const onDrainTimeout = vi.fn(settled);
    const cleanup = vi.fn(async () => {
      order.add('cleanup');
    });
    const { target, exit, log } = buildShutdown({
      drain,
      onDrainTimeout,
      close: async () => {
        await closing.promise;
        order.add('close');
      },
      cleanup,
    });

    target.emit('SIGTERM', 'SIGTERM');
    await vi.advanceTimersByTimeAsync(0);
    expect(drain).toHaveBeenCalledOnce();
    expect(log.info).toHaveBeenCalledWith('Job queue drained.');
    expect(cleanup).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();

    closing.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(onDrainTimeout).not.toHaveBeenCalled();
    expect(cleanup).toHaveBeenCalledOnce();
    expect([...order]).toEqual(['drain', 'close', 'cleanup']);
    expect(exit).toHaveBeenCalledExactlyOnceWith(0);
    expect(log.warn).not.toHaveBeenCalled();
  });

  it('awaits onDrainTimeout before cleanup when drain times out, then exits 0', async () => {
    const order = new Set<string>();
    const close = vi.fn(async () => {
      order.add('close');
    });
    const onDrainTimeout = vi.fn(async () => {
      order.add('onDrainTimeout');
    });
    const cleanup = vi.fn(async () => {
      order.add('cleanup');
    });
    const { target, exit, log } = buildShutdown({
      drain: async () => new Promise<void>(noop),
      onDrainTimeout,
      close,
      cleanup,
    });

    target.emit('SIGTERM', 'SIGTERM');
    await vi.advanceTimersByTimeAsync(0);
    expect(close).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(drainTimeoutMs - 1);
    expect(exit).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(log.warn).toHaveBeenCalledExactlyOnceWith(
      `Job queue drain timed out after ${drainTimeoutMs} ms; remaining claimed jobs will be released.`
    );
    expect(onDrainTimeout).toHaveBeenCalledOnce();
    expect(cleanup).toHaveBeenCalledOnce();
    expect([...order]).toEqual(['close', 'onDrainTimeout', 'cleanup']);
    expect(exit).toHaveBeenCalledExactlyOnceWith(0);
  });

  it('replaces non-kept listeners and handles only the first signal across all signals', async () => {
    const target = signalTarget();
    const kept = vi.fn();
    const serverHandler = vi.fn();
    const drain = vi.fn(settled);
    const exit = vi.fn();
    target.on('SIGTERM', kept);
    target.on('SIGTERM', serverHandler);

    installGracefulShutdown({
      signals,
      keep: new Map([['SIGTERM', [kept]]]),
      drain,
      drainTimeoutMs,
      close: settled,
      exit,
      log: { info: noop, warn: noop },
      target,
    });

    expect(target.listeners('SIGTERM')).toHaveLength(2);
    expect(target.listeners('SIGTERM')).toContain(kept);
    expect(target.listeners('SIGTERM')).not.toContain(serverHandler);

    target.emit('SIGTERM', 'SIGTERM');
    target.emit('SIGINT', 'SIGINT');
    await vi.advanceTimersByTimeAsync(0);

    expect(kept).toHaveBeenCalledOnce();
    expect(drain).toHaveBeenCalledOnce();
    expect(exit).toHaveBeenCalledOnce();
    expect(target.listeners('SIGTERM')).toEqual([kept]);
    expect(target.listeners('SIGINT')).toEqual([]);
  });
});
