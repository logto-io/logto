import { useEffect, useRef } from 'react';

const defaultDelay = 500;

const useDebounce = (delay: number = defaultDelay) => {
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

  return (callback: () => void) => {
    clearTimer();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    timerRef.current = setTimeout(() => {
      callback();
      clearTimer();
    }, delay);
  };
};

export default useDebounce;
