import type { DependencyList, EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

const useUpdateEffect = (effect: EffectCallback, dependencies: DependencyList | undefined = []) => {
  const isMounted = useRef(false);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isMounted.current = true;

      return;
    }

    return effect();
  }, [effect, ...dependencies]);
};

export default useUpdateEffect;
