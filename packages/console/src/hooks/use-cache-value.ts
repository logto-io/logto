import { useEffect, useState } from 'react';

const useCacheValue = <T>(value: T) => {
  const [cachedValue, setCachedValue] = useState<T>();

  useEffect(() => {
    if (value !== undefined) {
      setCachedValue(value);
    }
  }, [value]);

  return cachedValue;
};

export default useCacheValue;
