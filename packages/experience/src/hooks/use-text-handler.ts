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

  const downloadText = useCallback((text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    // eslint-disable-next-line @silverhand/fp/no-mutation
    downloadLink.href = URL.createObjectURL(blob);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    downloadLink.download = filename;
    downloadLink.click();
  }, []);

  return {
    copyText,
    downloadText,
  };
};

export default useTextHandler;
