import { ApplicationType } from '@logto/schemas';

import nativeAppIcon from '@/assets/images/native-app.svg';
import singlePageAppIcon from '@/assets/images/single-page-app.svg';
import traditionalWebAppIcon from '@/assets/images/traditional-web-app.svg';

export const ApplicationIcon = {
  [ApplicationType.Native]: nativeAppIcon,
  [ApplicationType.SPA]: singlePageAppIcon,
  [ApplicationType.Traditional]: traditionalWebAppIcon,
};
