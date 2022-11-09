/* istanbul ignore file */

import type { KeyboardEventHandler, KeyboardEvent } from 'react';

type callbackHandler<T> = ((event: KeyboardEvent<T>) => void) | undefined;

type callbackHandlerMap<T> = Record<string, callbackHandler<T>>;

export const onKeyDownHandler =
  <T = Element>(callback?: callbackHandler<T> | callbackHandlerMap<T>): KeyboardEventHandler<T> =>
  (event) => {
    const { key } = event;

    if (typeof callback === 'function' && [' ', 'Enter'].includes(key)) {
      callback(event);
      event.preventDefault();
    }

    if (typeof callback === 'object') {
      callback[key]?.(event);

      if (callback[key]) {
        event.preventDefault();
      }
    }
  };
