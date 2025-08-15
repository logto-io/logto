import classNames from 'classnames';
import type { ForwardedRef, HTMLProps } from 'react';
import { forwardRef } from 'react';

import styles from './index.module.scss';

type Props = HTMLProps<HTMLTextAreaElement> & {
  readonly className?: string;
  readonly error?: string | boolean;
  readonly description?: string;
};

function Textarea(
  { className, error, description, ...rest }: Props,
  reference: ForwardedRef<HTMLTextAreaElement>
) {
  return (
    <>
      <div className={classNames(styles.container, Boolean(error) && styles.error, className)}>
        <textarea {...rest} ref={reference} />
      </div>
      {Boolean(error) && typeof error !== 'boolean' && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      {description && <div className={styles.description}>{description}</div>}
    </>
  );
}

export default forwardRef(Textarea);
