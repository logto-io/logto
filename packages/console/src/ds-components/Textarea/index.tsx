import classNames from 'classnames';
import type { ForwardedRef, HTMLProps } from 'react';
import { forwardRef } from 'react';

import { useReadOnlyField } from '@/contexts/ReadOnlyAccessProvider';

import styles from './index.module.scss';

type Props = HTMLProps<HTMLTextAreaElement> & {
  readonly className?: string;
  readonly error?: string | boolean;
  readonly description?: string;
};

function Textarea(
  { className, error, description, readOnly, ...rest }: Props,
  reference: ForwardedRef<HTMLTextAreaElement>
) {
  const isReadOnlyField = useReadOnlyField();

  return (
    <>
      <div className={classNames(styles.container, Boolean(error) && styles.error, className)}>
        <textarea {...rest} ref={reference} readOnly={Boolean(readOnly) || isReadOnlyField} />
      </div>
      {Boolean(error) && typeof error !== 'boolean' && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      {description && <div className={styles.description}>{description}</div>}
    </>
  );
}

export default forwardRef(Textarea);
