import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';

import DynamicT from '@/ds-components/DynamicT';

import LearnMore, { type Props as LearnMoreProps } from '../LearnMore';

import FormCardLayout from './FormCardLayout';
import styles from './index.module.scss';

export type Props = {
  readonly title: AdminConsoleKey;
  readonly tag?: ReactNode;
  readonly description?: AdminConsoleKey;
  readonly descriptionInterpolation?: Record<string, unknown>;
  readonly learnMoreLink?: LearnMoreProps;
  readonly children: ReactNode;
};

function FormCard({
  title,
  tag,
  description,
  descriptionInterpolation,
  learnMoreLink,
  children,
}: Props) {
  return (
    <FormCardLayout
      introduction={
        <>
          <div className={styles.title}>
            <DynamicT forKey={title} />
            {tag}
          </div>
          {description && (
            <div className={styles.description}>
              <DynamicT forKey={description} interpolation={descriptionInterpolation} />
              {learnMoreLink?.href && <LearnMore {...learnMoreLink} />}
            </div>
          )}
        </>
      }
    >
      {children}
    </FormCardLayout>
  );
}

export default FormCard;

export { default as FormCardSkeleton } from './Skeleton';
