import classNames from 'classnames';
import { Toaster, resolveValue } from 'react-hot-toast';

import Error from '@/assets/icons/toast-error.svg';
import Success from '@/assets/icons/toast-success.svg';

import * as styles from './index.module.scss';

function Toast() {
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
          <div className={styles.message}>{resolveValue(toastInstance.message, toastInstance)}</div>
        </div>
      )}
    </Toaster>
  );
}

export default Toast;
