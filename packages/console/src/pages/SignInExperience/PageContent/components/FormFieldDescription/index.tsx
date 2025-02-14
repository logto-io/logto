import { type ReactNode } from 'react';

import LearnMore, { type Props as LearnMoreProps } from '@/components/LearnMore';

import styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
  readonly learnMoreLink?: LearnMoreProps;
};

function FormFieldDescription({ children, learnMoreLink }: Props) {
  return (
    <div className={styles.formFieldDescription}>
      {children}
      {learnMoreLink && <LearnMore {...learnMoreLink} />}
    </div>
  );
}

export default FormFieldDescription;
