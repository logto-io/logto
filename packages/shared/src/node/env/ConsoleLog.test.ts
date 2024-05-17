import { noop } from '@silverhand/essentials';
import { describe, expect, it, vi } from 'vitest';

import ConsoleLog from './ConsoleLog.js';

describe('ConsoleLog', () => {
  it('logs the plain message as is', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(noop);
    new ConsoleLog().plain('message', 1, undefined, null);

    expect(logSpy).toHaveBeenCalledWith('message', 1, undefined, null);
  });

  it('logs the info message with an info prefix', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(noop);
    new ConsoleLog().info('message', 1, null);

    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/info/), 'message', 1, null);
  });

  it('logs the success message with an info and checkmark prefix', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(noop);
    new ConsoleLog().succeed('message', 1, undefined, null);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/info/),
      expect.stringMatching(/✔/),
      'message',
      1,
      undefined,
      null
    );
  });

  it('logs the warn message with a warn prefix', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(noop);
    new ConsoleLog().warn('message', { a: 1 });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/warn/), 'message', { a: 1 });
  });

  it('logs the error message with a error prefix', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);
    new ConsoleLog().error('message', { a: 1 });

    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/error/), 'message', {
      a: 1,
    });
  });

  it('logs the fatal message with a fatal prefix and exits the process', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);
    // @ts-expect-error process exit is mocked
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(noop);
    new ConsoleLog().fatal('message', { a: 1 });

    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/fatal/), 'message', { a: 1 });
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('logs the message with a custom prefix', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(noop);
    new ConsoleLog('custom').plain('message', 1, null);

    expect(logSpy).toHaveBeenCalledWith('custom  ', 'message', 1, null);
  });

  it('logs the message with a custom prefix and an info prefix', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(noop);
    new ConsoleLog('custom').info('message', 1, null);

    expect(logSpy).toHaveBeenCalledWith(
      'custom  ',
      expect.stringMatching(/info/),
      'message',
      1,
      null
    );
  });

  it('logs the message with a custom prefix and padding', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(noop);
    new ConsoleLog('custom', 10).plain('message', 1, null);

    expect(logSpy).toHaveBeenCalledWith('custom    ', 'message', 1, null);
  });
});
