import React from 'react';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import Close from '@/icons/Close';

import * as styles from './index.module.scss';

type Props = {
  appName: string;
  selectedSdk: string;
  isCompact?: boolean;
  onClose: () => void;
};

const onClickFetchSampleProject = (projectName: string) => {
  const sampleUrl = `https://github.com/logto-io/js/tree/master/packages/${projectName}-sample`;
  window.open(sampleUrl, '_blank');
};

const GuideHeader = ({ appName, selectedSdk, isCompact = false, onClose }: Props) => {
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
          <Button type="plain" size="small" title="general.skip" onClick={onClose} />
          <Button
            className={styles.getSampleButton}
            type="outline"
            title="admin_console.applications.guide.get_sample_file"
            onClick={() => {
              onClickFetchSampleProject(selectedSdk);
            }}
          />
        </>
      )}
    </div>
  );
};

export default GuideHeader;
