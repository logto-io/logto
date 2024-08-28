import Native from '@/assets/icons/connector-platform-icon-native.svg';
import Web from '@/assets/icons/connector-platform-icon-web.svg';
import { PreviewPlatform } from '@/components/SignInExperiencePreview/types';

import PlatformTab from './PlatformTab';
import * as styles from './index.module.scss';

type Props = {
  readonly currentTab: PreviewPlatform;
  readonly onSelect: (tab: PreviewPlatform) => void;
};

function PlatformTabs({ currentTab, onSelect }: Props) {
  return (
    <div className={styles.container}>
      <PlatformTab
        icon={<Web />}
        title="cloud.sie.preview.web_tab"
        tab={PreviewPlatform.DesktopWeb}
        isSelected={currentTab === PreviewPlatform.DesktopWeb}
        onClick={onSelect}
      />
      <PlatformTab
        icon={<Native />}
        title="cloud.sie.preview.mobile_tab"
        tab={PreviewPlatform.MobileWeb}
        isSelected={currentTab === PreviewPlatform.MobileWeb}
        onClick={onSelect}
      />
    </div>
  );
}

export default PlatformTabs;
