import { type Resource } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ArrowLeft from '@/assets/icons/arrow-left.svg?react';
import Close from '@/assets/icons/close.svg?react';
import { type SelectedGuide } from '@/components/Guide/GuideCard';
import GuideCardGroup from '@/components/Guide/GuideCardGroup';
import { useApiGuideMetadata } from '@/components/Guide/hooks';
import IconButton from '@/ds-components/IconButton';
import Spacer from '@/ds-components/Spacer';

import ApiGuide from '../ApiGuide';

import styles from './index.module.scss';

type Props = {
  readonly apiResource: Resource;
  readonly onClose: () => void;
};

function GuideDrawer({ apiResource, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.guide' });
  const guides = useApiGuideMetadata();
  const [selectedGuide, setSelectedGuide] = useState<SelectedGuide>();

  return (
    <div className={styles.drawerContainer}>
      <div className={styles.header}>
        {selectedGuide && (
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
            <span>{t('checkout_tutorial', { name: selectedGuide.name })}</span>
          </>
        )}
        {!selectedGuide && t('api.select_a_tutorial')}
        <Spacer />
        <IconButton size="large" onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      {!selectedGuide && (
        <GuideCardGroup
          className={styles.cardGroup}
          guides={guides}
          onClickGuide={(guide) => {
            setSelectedGuide(guide);
          }}
        />
      )}
      {selectedGuide && (
        <ApiGuide
          isCompact
          className={styles.guide}
          guideId={selectedGuide.id}
          apiResource={apiResource}
          onClose={() => {
            setSelectedGuide(undefined);
          }}
        />
      )}
    </div>
  );
}

export default GuideDrawer;
