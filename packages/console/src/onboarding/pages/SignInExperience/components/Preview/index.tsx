import type { SignInExperience } from '@logto/schemas';
import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';

import LivePreviewButton from '@/components/LivePreviewButton';
import SignInExperiencePreview from '@/components/SignInExperiencePreview';
import { PreviewPlatform } from '@/components/SignInExperiencePreview/types';

import PlatformTabs from '../PlatformTabs';
import * as styles from './index.module.scss';

type Props = {
  signInExperience?: SignInExperience;
  isLivePreviewDisabled?: boolean;
  className?: string;
};

const Preview = ({ signInExperience, isLivePreviewDisabled = false, className }: Props) => {
  const [currentTab, setCurrentTab] = useState(PreviewPlatform.DesktopWeb);

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.topBar}>
        <PlatformTabs currentTab={currentTab} onSelect={setCurrentTab} />
        <LivePreviewButton type="violet" isDisabled={isLivePreviewDisabled} />
      </div>
      <SignInExperiencePreview
        platform={currentTab}
        mode={Theme.Light}
        signInExperience={signInExperience}
      />
    </div>
  );
};

export default Preview;
