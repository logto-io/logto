import { onResize, useIsomorphicLayoutEffect } from '@react-spring/shared';
import { useSpring, animated, config } from '@react-spring/web';
import type { Nullable } from '@silverhand/essentials';
import { cloneElement, useCallback, useRef, useState } from 'react';

import * as styles from './index.module.scss';

type Props = {
  readonly children: JSX.Element; // Limit to one element
  readonly isVisible: boolean;
};

const AnimatedPrefix = ({ children, isVisible }: Props) => {
  const [domReady, setDomReady] = useState(false);
  const elementRef = useRef<Nullable<HTMLElement>>(null);

  // Get target width for the children
  const getTargetWidth = useCallback(
    () => (isVisible ? elementRef.current?.getBoundingClientRect().width : 0),
    [isVisible]
  );

  const [animation, api] = useSpring(
    () => ({ width: getTargetWidth(), config: { ...config.default, clamp: true } }),
    [getTargetWidth, domReady]
  );

  useIsomorphicLayoutEffect(() => {
    const { current } = elementRef;

    setDomReady(true);

    const cleanup =
      current &&
      onResize(
        () => {
          void api.start({ width: getTargetWidth() });
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
    <animated.div className={styles.prefix} style={animation} data-testid="prefix">
      {cloneElement(children, { ref: elementRef, isVisible })}
    </animated.div>
  );
};

export default AnimatedPrefix;
