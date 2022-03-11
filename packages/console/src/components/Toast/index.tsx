import classNames from 'classnames';
import React from 'react';
import { Toaster } from 'react-hot-toast';

import * as styles from './index.module.scss';

const Toast = () => {
  return (
    <Toaster
      toastOptions={{
        className: styles.toast,
        success: { className: classNames(styles.toast, styles.success) },
      }}
    />
  );
};

export default Toast;
