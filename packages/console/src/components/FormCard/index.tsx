import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';

import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';
import type { Props as TextLinkProps } from '@/ds-components/TextLink';

import FormCardLayout from './FormCardLayout';
import * as styles from './index.module.scss';

export type Props = {
  readonly title: AdminConsoleKey;
  readonly tag?: ReactNode;
  readonly description?: AdminConsoleKey;
  readonly descriptionInterpolation?: Record<string, unknown>;
  readonly learnMoreLink?: Pick<TextLinkProps, 'href' | 'targetBlank'> & {
    linkText?: AdminConsoleKey;
  };
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
              {learnMoreLink?.href && (
                <>
                  {' '}
                  <TextLink href={learnMoreLink.href} targetBlank={learnMoreLink.targetBlank}>
                    <DynamicT forKey={learnMoreLink.linkText ?? 'general.learn_more'} />
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
