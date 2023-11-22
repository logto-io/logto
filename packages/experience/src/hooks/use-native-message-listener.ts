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
      if (event.origin === window.location.origin) {
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
