import { useEffect, useRef } from 'react';

const useDebounce = () => {
  const timerRef = useRef<NodeJS.Timeout>();

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (callback: () => void, wait: number) => {
    clearTimer();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    timerRef.current = setTimeout(() => {
      callback();
      clearTimer();
    }, wait);
  };
};

export default useDebounce;
