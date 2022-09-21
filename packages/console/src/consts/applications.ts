import { ApplicationType } from '@logto/schemas';

import NativeAppDark from '@/assets/images/native-app-dark.svg';
import NativeApp from '@/assets/images/native-app.svg';
import SinglePageAppDark from '@/assets/images/single-page-app-dark.svg';
import SinglePageApp from '@/assets/images/single-page-app.svg';
import TraditionalWebAppDark from '@/assets/images/traditional-web-app-dark.svg';
import TraditionalWebApp from '@/assets/images/traditional-web-app.svg';

type ApplicationIconMap = {
  [key in ApplicationType]: SvgComponent;
};

export const lightModeApplicationIconMap: ApplicationIconMap = Object.freeze({
  [ApplicationType.Native]: NativeApp,
  [ApplicationType.SPA]: SinglePageApp,
  [ApplicationType.Traditional]: TraditionalWebApp,
  [ApplicationType.MachineToMachine]: TraditionalWebApp,
} as const);

export const darkModeApplicationIconMap: ApplicationIconMap = Object.freeze({
  [ApplicationType.Native]: NativeAppDark,
  [ApplicationType.SPA]: SinglePageAppDark,
  [ApplicationType.Traditional]: TraditionalWebAppDark,
  [ApplicationType.MachineToMachine]: TraditionalWebAppDark,
} as const);
