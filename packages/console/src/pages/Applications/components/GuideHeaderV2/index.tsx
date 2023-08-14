import { useCallback, useState } from 'react';

import Box from '@/assets/icons/box.svg';
import Close from '@/assets/icons/close.svg';
import { isCloud } from '@/consts/env';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import DangerousRaw from '@/ds-components/DangerousRaw';
import IconButton from '@/ds-components/IconButton';
import Spacer from '@/ds-components/Spacer';

import RequestGuide from './RequestGuide';
import * as styles from './index.module.scss';

type Props = {
  appName: string;
  isCompact?: boolean;
  onClose: () => void;
};

function GuideHeaderV2({ appName, isCompact = false, onClose }: Props) {
  const [isRequestGuideOpen, setIsRequestGuideOpen] = useState(false);
  const onRequestGuideClose = useCallback(() => {
    setIsRequestGuideOpen(false);
  }, []);

  return (
    <div className={styles.header}>
      {isCompact && (
        <>
          <CardTitle
            size="small"
            title={<DangerousRaw>{appName}</DangerousRaw>}
            subtitle="applications.guide.header_description"
          />
          <Spacer />
          <IconButton size="large" onClick={onClose}>
            <Close className={styles.closeIcon} />
          </IconButton>
        </>
      )}
      {!isCompact && (
        <>
          <IconButton size="large" onClick={onClose}>
            <Close className={styles.closeIcon} />
          </IconButton>
          <div className={styles.separator} />
          <CardTitle
            size="small"
            title={<DangerousRaw>{appName}</DangerousRaw>}
            subtitle="applications.guide.header_description"
          />
          <Spacer />
          <Button
            className={styles.requestSdkButton}
            type="outline"
            icon={<Box />}
            title="applications.guide.cannot_find_guide"
            onClick={() => {
              setIsRequestGuideOpen(true);
            }}
          />
        </>
      )}
      {isCloud && <RequestGuide isOpen={isRequestGuideOpen} onClose={onRequestGuideClose} />}
    </div>
  );
}

export default GuideHeaderV2;
