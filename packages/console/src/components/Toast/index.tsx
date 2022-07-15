import classNames from 'classnames';
import { Toaster, resolveValue } from 'react-hot-toast';

import Error from '@/assets/images/toast-error.svg';
import Success from '@/assets/images/toast-success.svg';

import * as styles from './index.module.scss';

const Toast = () => {
  return (
    <Toaster
      toastOptions={{
        className: styles.toast,
        success: {
          className: classNames(styles.toast, styles.success),
          icon: <Success />,
        },
        error: {
          className: classNames(styles.toast, styles.error),
          icon: <Error />,
        },
      }}
    >
      {(toastInstance) => (
        <div className={toastInstance.className}>
          <div className={styles.image}>{toastInstance.icon}</div>
          <span className={styles.message}>
            {resolveValue(toastInstance.message, toastInstance)}
          </span>
        </div>
      )}
    </Toaster>
  );
};

export default Toast;
