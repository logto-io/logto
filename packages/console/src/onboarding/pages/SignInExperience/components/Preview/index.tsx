import type { SignInExperience } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useState } from 'react';

import LivePreviewButton from '@/components/LivePreviewButton';
import SignInExperiencePreview from '@/components/SignInExperiencePreview';
import { PreviewPlatform, UiTheme } from '@/components/SignInExperiencePreview/types';

import PlatformTabs from '../PlatformTabs';
import * as styles from './index.module.scss';

type Props = {
  signInExperience?: SignInExperience;
  isLivePreviewDisabled?: boolean;
  className?: string;
};

const Preview = ({ signInExperience, isLivePreviewDisabled = false, className }: Props) => {
  const [currentTab, setCurrentTab] = useState(PreviewPlatform.MobileWeb);

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.topBar}>
        <PlatformTabs currentTab={currentTab} onSelect={setCurrentTab} />
        <LivePreviewButton
          isDisabled={isLivePreviewDisabled}
          className={styles.button}
          iconClassName={conditional(!isLivePreviewDisabled && styles.livePreviewIcon)}
        />
      </div>
      <SignInExperiencePreview
        platform={currentTab}
        mode={UiTheme.Light}
        signInExperience={signInExperience}
      />
    </div>
  );
};

export default Preview;
