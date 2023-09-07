import { useEffect, useLayoutEffect, useRef } from 'react';

type Callback = (event?: UIEvent) => void;

const useWindowResize = (callback: Callback) => {
  const callbackRef = useRef<Callback>(callback);

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    callbackRef.current = callback;
  }, [callback]);

  useLayoutEffect(() => {
    const handler: Callback = (event) => {
      callbackRef.current(event);
    };

    handler();
    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
};

export default useWindowResize;
