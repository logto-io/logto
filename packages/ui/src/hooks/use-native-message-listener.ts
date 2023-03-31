import { useEffect } from 'react';

import { isNativeWebview } from '@/utils/native-sdk';

import useToast from './use-toast';

const useNativeMessageListener = () => {
  const { setToast } = useToast();

  // Monitor Native Error Message
  useEffect(() => {
    if (!isNativeWebview()) {
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
  }, [setToast]);
};

export default useNativeMessageListener;
