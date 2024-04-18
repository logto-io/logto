import type { SignInExperience } from '@logto/schemas';
import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';

import SignInExperiencePreview from '@/components/SignInExperiencePreview';
import { PreviewPlatform } from '@/components/SignInExperiencePreview/types';

import PlatformTabs from './PlatformTabs';
import * as styles from './index.module.scss';

type Props = {
  readonly signInExperience?: SignInExperience;
  readonly className?: string;
};

function Preview({ signInExperience, className }: Props) {
  const [currentTab, setCurrentTab] = useState(PreviewPlatform.DesktopWeb);

  return (
    <div className={classNames(styles.container, className)}>
      <PlatformTabs currentTab={currentTab} onSelect={setCurrentTab} />
      <SignInExperiencePreview
        platform={currentTab}
        mode={Theme.Light}
        signInExperience={signInExperience}
      />
    </div>
  );
}

export default Preview;
