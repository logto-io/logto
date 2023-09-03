import type { KeyboardEventHandler, KeyboardEvent } from 'react';

type CallbackHandler<T> = ((event: KeyboardEvent<T>) => void) | undefined;

type CallbackHandlerMap<T> = Record<string, CallbackHandler<T>>;

export const onKeyDownHandler =
  <T = Element>(callback?: CallbackHandler<T> | CallbackHandlerMap<T>): KeyboardEventHandler<T> =>
  (event) => {
    const { key } = event;

    if (typeof callback === 'function' && [' ', 'Enter'].includes(key)) {
      callback(event);
      event.preventDefault();
    }

    if (typeof callback === 'object') {
      const handler = callback[key];

      if (handler) {
        handler(event);
        event.preventDefault();
      }
    }
  };
