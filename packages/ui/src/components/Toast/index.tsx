import { useState, useRef, useEffect, useCallback } from 'react';

import * as styles from './index.module.scss';

type Props = {
  message: string;
  isVisible?: boolean;
  duration?: number;
  callback?: () => void;
};

const Toast = ({ message, isVisible = false, duration = 3000, callback }: Props) => {
  const toastElement = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  const callbackHandler = useCallback(() => {
    // Only execute on hide transitionend event
    if (toastElement.current?.dataset.visible === 'true') {
      return;
    }

    callback?.();
  }, [callback]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => {
      clearTimeout(timer);
      setShow(false);
    };
  }, [callback, duration, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.toastContainer}>
      <div
        ref={toastElement}
        className={styles.toast}
        data-visible={show}
        onTransitionEnd={callbackHandler}
      >
        {message}
      </div>
    </div>
  );
};

export default Toast;
