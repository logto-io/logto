import classNames from 'classnames';
import React from 'react';
import { Toaster, resolveValue, toast } from 'react-hot-toast';

import errorIcon from '@/assets/images/toast-error.svg';
import successIcon from '@/assets/images/toast-success.svg';
import Close from '@/icons/Close';

import IconButton from '../IconButton';
import * as styles from './index.module.scss';

const Toast = () => {
  return (
    <Toaster
      toastOptions={{
        className: styles.toast,
        success: {
          className: classNames(styles.toast, styles.success),
          icon: <img src={successIcon} />,
        },
        error: {
          className: classNames(styles.toast, styles.error),
          icon: <img src={errorIcon} />,
        },
      }}
    >
      {(toastInstance) => (
        <div className={toastInstance.className}>
          <div className={styles.image}>{toastInstance.icon}</div>
          <span className={styles.message}>
            {resolveValue(toastInstance.message, toastInstance)}
          </span>
          <IconButton
            onClick={() => {
              toast.remove();
            }}
          >
            <Close className={styles.closeIcon} />
          </IconButton>
        </div>
      )}
    </Toaster>
  );
};

export default Toast;
