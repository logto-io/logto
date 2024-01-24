import { type ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

function FormFieldDescription({ children }: Props) {
  return <div className={styles.formFieldDescription}>{children}</div>;
}

export default FormFieldDescription;
