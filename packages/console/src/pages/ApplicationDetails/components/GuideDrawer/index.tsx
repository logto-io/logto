import { type ApplicationResponse } from '@logto/schemas';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ArrowLeft from '@/assets/icons/arrow-left.svg';
import Close from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';
import Spacer from '@/ds-components/Spacer';
import Guide from '@/pages/Applications/components/Guide';
import { type SelectedGuide } from '@/pages/Applications/components/GuideCard';
import GuideGroup from '@/pages/Applications/components/GuideGroup';
import useAppGuideMetadata from '@/pages/Applications/components/GuideLibrary/hook';

import * as styles from './index.module.scss';

type Props = {
  app: ApplicationResponse;
  onClose: () => void;
};

function GuideDrawer({ app, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.applications.guide' });
  const [_, getStructuredMetadata] = useAppGuideMetadata();
  const [selectedGuide, setSelectedGuide] = useState<SelectedGuide>();

  const structuredMetadata = useMemo(
    () => getStructuredMetadata({ categories: [app.type] }),
    [getStructuredMetadata, app.type]
  );

  const hasSingleGuide = useMemo(() => {
    return structuredMetadata[app.type].length === 1;
  }, [app.type, structuredMetadata]);

  useEffect(() => {
    if (hasSingleGuide) {
      const guide = structuredMetadata[app.type][0];
      if (guide) {
        const {
          id,
          metadata: { target, name },
        } = guide;
        setSelectedGuide({ id, target, name });
      }
    }
  }, [hasSingleGuide, app.type, structuredMetadata]);

  return (
    <div className={styles.drawerContainer}>
      <div className={styles.header}>
        {selectedGuide && (
          <>
            {!hasSingleGuide && (
              <>
                <IconButton
                  size="large"
                  onClick={() => {
                    setSelectedGuide(undefined);
                  }}
                >
                  <ArrowLeft />
                </IconButton>
                <div className={styles.separator} />
              </>
            )}
            <span>{t('checkout_tutorial', { name: selectedGuide.name })}</span>
          </>
        )}
        {!selectedGuide && t('select_a_framework')}
        <Spacer />
        <IconButton size="large" onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      {!selectedGuide && (
        <GuideGroup
          className={styles.cardGroup}
          categoryName={t(`categories.${app.type}`)}
          guides={structuredMetadata[app.type]}
          onClickGuide={(guide) => {
            setSelectedGuide(guide);
          }}
        />
      )}
      {selectedGuide && (
        <Guide
          isCompact
          className={styles.guide}
          guideId={selectedGuide.id}
          app={app}
          onClose={() => {
            setSelectedGuide(undefined);
          }}
        />
      )}
    </div>
  );
}

export default GuideDrawer;
