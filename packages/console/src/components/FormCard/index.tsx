import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';

import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';

import FormCardLayout from './FormCardLayout';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  tag?: ReactNode;
  description?: AdminConsoleKey;
  descriptionInterpolation?: Record<string, unknown>;
  learnMoreLink?: string;
  learnMoreLinkText?: AdminConsoleKey;
  children: ReactNode;
};

function FormCard({
  title,
  tag,
  description,
  descriptionInterpolation,
  learnMoreLink,
  learnMoreLinkText,
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
              {learnMoreLink && (
                <>
                  {' '}
                  <TextLink href={learnMoreLink} target="_blank" rel="noopener">
                    <DynamicT forKey={learnMoreLinkText ?? 'general.learn_more'} />
                  </TextLink>
                </>
              )}
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
