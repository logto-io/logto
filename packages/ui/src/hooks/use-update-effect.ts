import type { DependencyList, EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

const useUpdateEffect = (effect: EffectCallback, dependencies: DependencyList | undefined = []) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isMounted.current = true;

      return;
    }

    return effect();
  }, [...dependencies]);
};

export default useUpdateEffect;
