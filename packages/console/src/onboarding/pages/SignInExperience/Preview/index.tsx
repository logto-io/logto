import type { SignInExperience } from '@logto/schemas';
import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';

import SignInExperiencePreview from '@/components/SignInExperiencePreview';
import { PreviewPlatform } from '@/components/SignInExperiencePreview/types';

import PlatformTabs from './PlatformTabs';
import styles from './index.module.scss';

type Props = {
  readonly signInExperience?: SignInExperience;
  readonly className?: string;
  /**
   * The Logto endpoint to use for the preview. If not provided, the current tenant endpoint from
   * the `AppDataContext` will be used.
   */
  readonly endpoint?: URL;
};

function Preview({ signInExperience, className, endpoint }: Props) {
  const [currentTab, setCurrentTab] = useState(PreviewPlatform.DesktopWeb);

  return (
    <div className={classNames(styles.container, className)}>
      <PlatformTabs currentTab={currentTab} onSelect={setCurrentTab} />
      <SignInExperiencePreview
        platform={currentTab}
        mode={Theme.Light}
        signInExperience={signInExperience}
        endpoint={endpoint}
      />
    </div>
  );
}

export default Preview;
