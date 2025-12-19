import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type SelectedGuide } from '@/components/Guide/GuideCard';
import GuideCardGroup from '@/components/Guide/GuideCardGroup';
import { useAppGuideMetadata } from '@/components/Guide/hooks';
import { thirdPartyApp } from '@/consts/external-links';
import CardTitle from '@/ds-components/CardTitle';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { thirdPartyAppCategory } from '@/types/applications';

import styles from './index.module.scss';

type Props = {
  readonly onSelectGuide: (data: SelectedGuide) => void;
};

function ThirdPartyAppGuideLibrary({ onSelectGuide }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getStructuredAppGuideMetadata } = useAppGuideMetadata();
  const { getDocumentationUrl } = useDocumentationUrl();

  const thirdPartyGuides = useMemo(
    () => getStructuredAppGuideMetadata()[thirdPartyAppCategory],
    [getStructuredAppGuideMetadata]
  );

  if (thirdPartyGuides.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <CardTitle
        className={styles.title}
        subtitleClassName={styles.subtitle}
        title="applications.guide.third_party.title"
        subtitle={
          <Trans
            components={{
              a: <TextLink href={getDocumentationUrl(thirdPartyApp)} targetBlank="noopener" />,
            }}
          >
            {t('applications.guide.third_party.description')}
          </Trans>
        }
      />
      <GuideCardGroup
        hasCardBorder
        hasCardButton
        categoryName={t('guide.categories.ThirdParty')}
        guides={thirdPartyGuides}
        className={styles.library}
        onClickGuide={onSelectGuide}
      />
    </div>
  );
}

export default ThirdPartyAppGuideLibrary;
