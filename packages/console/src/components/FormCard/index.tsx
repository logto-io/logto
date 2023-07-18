import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';

import FormCardLayout from './FormCardLayout';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  tag?: ReactNode;
  description?: AdminConsoleKey;
  learnMoreLink?: string;
  learnMoreLinkText?: AdminConsoleKey;
  children: ReactNode;
};

function FormCard({ title, tag, description, learnMoreLink, learnMoreLinkText, children }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

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
              <DynamicT forKey={description} />
              {learnMoreLink && (
                <>
                  {' '}
                  <TextLink href={learnMoreLink} target="_blank" rel="noopener">
                    {t(learnMoreLinkText ?? 'general.learn_more')}
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
