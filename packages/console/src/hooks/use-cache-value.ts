import { useEffect, useRef } from 'react';

const useCacheValue = <T>(value: T) => {
  const cachedValue = useRef<T>();

  useEffect(() => {
    if (value !== undefined) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      cachedValue.current = value;
    }
  }, [value, cachedValue]);

  return cachedValue.current;
};

export default useCacheValue;
