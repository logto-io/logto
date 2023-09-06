import { useCallback, useState } from 'react';

import Box from '@/assets/icons/box.svg';
import Close from '@/assets/icons/close.svg';
import { githubIssuesLink } from '@/consts';
import { isCloud } from '@/consts/env';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import IconButton from '@/ds-components/IconButton';
import Spacer from '@/ds-components/Spacer';

import RequestGuide from './RequestGuide';
import * as styles from './index.module.scss';

type Props = {
  onClose: () => void;
};

function GuideHeader({ onClose }: Props) {
  const [isRequestGuideOpen, setIsRequestGuideOpen] = useState(false);
  const onRequestGuideClose = useCallback(() => {
    setIsRequestGuideOpen(false);
  }, []);

  return (
    <div className={styles.header}>
      <IconButton size="large" onClick={onClose}>
        <Close className={styles.closeIcon} />
      </IconButton>
      <div className={styles.separator} />
      <CardTitle
        size="small"
        title="applications.guide.modal_header_title"
        subtitle="applications.guide.header_subtitle"
      />
      <Spacer />
      <Button
        className={styles.requestSdkButton}
        type="outline"
        icon={<Box />}
        title="applications.guide.cannot_find_guide"
        onClick={() => {
          if (isCloud) {
            setIsRequestGuideOpen(true);
          } else {
            window.open(githubIssuesLink, '_blank');
          }
        }}
      />
      {isCloud && <RequestGuide isOpen={isRequestGuideOpen} onClose={onRequestGuideClose} />}
    </div>
  );
}

export default GuideHeader;
