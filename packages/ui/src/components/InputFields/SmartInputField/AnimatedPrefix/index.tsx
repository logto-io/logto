import { onResize, useIsomorphicLayoutEffect } from '@react-spring/shared';
import { useSpring, animated, config } from '@react-spring/web';
import type { Nullable } from '@silverhand/essentials';
import { cloneElement, useCallback, useRef } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: JSX.Element; // Limit to one element
  isVisible: boolean;
};

const AnimatedPrefix = ({ children, isVisible }: Props) => {
  const elementRef = useRef<Nullable<HTMLElement>>(null);

  // Get target width for the children
  const getTargetWidth = useCallback(
    () => (isVisible ? elementRef.current?.getBoundingClientRect().width : 0),
    [isVisible]
  );

  const [animation, api] = useSpring(
    () => ({ width: getTargetWidth(), config: { ...config.default, clamp: true } }),
    [getTargetWidth]
  );

  useIsomorphicLayoutEffect(() => {
    const { current } = elementRef;
    const cleanup =
      current &&
      onResize(
        () => {
          api.start({ width: getTargetWidth() });
        },
        { container: current }
      );

    return () => {
      // Stop animation before cleanup
      api.stop();
      cleanup?.();
    };
  }, [api, getTargetWidth]);

  return (
    <animated.div className={styles.prefix} style={animation}>
      {cloneElement(children, { ref: elementRef })}
    </animated.div>
  );
};

export default AnimatedPrefix;
