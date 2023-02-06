import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: React.ReactNode;
  isVisible: boolean;
};

const AnimatedPrefix = ({ children, isVisible }: Props) => {
  const [show, setShow] = useState(isVisible);

  const [animation] = useSpring(
    () => ({
      from: { maxWidth: isVisible ? 0 : 100 },
      to: { maxWidth: isVisible ? 100 : 0 },
      config: { duration: 200 },
      onStart: () => {
        if (isVisible) {
          setShow(true);
        }
      },
      onResolve: () => {
        if (!isVisible) {
          setShow(false);
        }
      },
    }),
    [isVisible]
  );

  return (
    <animated.div className={styles.prefix} style={animation}>
      {show && children}
    </animated.div>
  );
};

export default AnimatedPrefix;
