import classNames from 'classnames';
import React, { forwardRef, HTMLProps } from 'react';

import * as styles from './index.module.scss';

// https://github.com/yannickcr/eslint-plugin-react/issues/2856
/* eslint-disable react/require-default-props */
type Props = HTMLProps<HTMLInputElement> & {
  hasError?: boolean;
};
/* eslint-enable react/require-default-props */

const TextInput = forwardRef<HTMLInputElement, Props>(
  ({ hasError = false, ...rest }, reference) => {
    return (
      <div className={classNames(styles.container, hasError && styles.error)}>
        <input type="text" {...rest} ref={reference} />
      </div>
    );
  }
);

export default TextInput;
