import { useCallback } from 'react';

import useToast from './use-toast';

const useTextHandler = () => {
  const { setToast } = useToast();

  const copyText = useCallback(
    async (text: string, successMessage: string) => {
      await navigator.clipboard.writeText(text);
      setToast(successMessage);
    },
    [setToast]
  );

  // Todo: @xiaoyijun add download text file handler

  return {
    copyText,
  };
};

export default useTextHandler;
