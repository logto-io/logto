import { type ReactNode } from 'react';

import styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
};

function FormFieldDescription({ children }: Props) {
  return <div className={styles.formFieldDescription}>{children}</div>;
}

export default FormFieldDescription;
