import type { SignInExperience } from '@logto/schemas';
import { AppearanceMode } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useState } from 'react';

import LivePreviewButton from '@/components/LivePreviewButton';
import SignInExperiencePreview from '@/components/SignInExperiencePreview';
import { PreviewPlatform } from '@/components/SignInExperiencePreview/types';
import ToggleThemeButton from '@/components/ToggleThemeButton';

import PlatformTabs from '../PlatformTabs';
import * as styles from './index.module.scss';

type Props = {
  signInExperience?: SignInExperience;
  isLivePreviewDisabled?: boolean;
  className?: string;
};

const Preview = ({ signInExperience, isLivePreviewDisabled = false, className }: Props) => {
  const [currentTab, setCurrentTab] = useState(PreviewPlatform.MobileWeb);
  const [mode, setMode] = useState<Omit<AppearanceMode, AppearanceMode.SyncWithSystem>>(
    AppearanceMode.LightMode
  );

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.topBar}>
        <PlatformTabs currentTab={currentTab} onSelect={setCurrentTab} />
        <div className={styles.actions}>
          <ToggleThemeButton
            className={classNames(styles.button, styles.themeButton)}
            iconClassName={styles.themeIcon}
            value={mode}
            onToggle={setMode}
          />
          <LivePreviewButton
            isDisabled={isLivePreviewDisabled}
            className={styles.button}
            iconClassName={conditional(!isLivePreviewDisabled && styles.livePreviewIcon)}
          />
        </div>
      </div>
      <SignInExperiencePreview
        platform={currentTab}
        mode={mode}
        signInExperience={signInExperience}
      />
    </div>
  );
};

export default Preview;
