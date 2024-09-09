import { isObject } from '@silverhand/essentials';
import { useEffect } from 'react';

import { isNativeWebview } from '@/utils/native-sdk';

import useToast from './use-toast';

/**
 * UseNativeMessageListener
 *
 * Used to monitor native error message.
 * If native error message is sent, it will be displayed as toast.
 * Add a bypass parameter to bypass the native error message listener.
 *
 * @param {boolean} bypass (default: false)
 */
const useNativeMessageListener = (bypass = false) => {
  const { setToast } = useToast();

  // Monitor Native Error Message
  useEffect(() => {
    if (!isNativeWebview() || bypass) {
      return;
    }

    const nativeMessageHandler = (event: MessageEvent) => {
      // In the `WKWebView` of new iOS versions, some script will constantly post messages to the
      // window object with increasing numbers as the message content ("1", "2", "3", ...).
      //
      // Ideally, we should check the source of the message with Logto-specific identifier in the
      // `event.data`; however, this change will result a breaking change for the existing
      // native SDK implementations. Add the `isObject` check to prevent the crazy messages while
      // keeping the backward compatibility.
      if (event.origin === window.location.origin && isObject(event.data)) {
        try {
          setToast(JSON.stringify(event.data));
        } catch {}
      }
    };

    window.addEventListener('message', nativeMessageHandler);

    return () => {
      window.removeEventListener('message', nativeMessageHandler);
    };
  }, [bypass, setToast]);
};

export default useNativeMessageListener;
