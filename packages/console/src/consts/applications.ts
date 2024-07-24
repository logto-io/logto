import { ApplicationType } from '@logto/schemas';

import MachineToMachineDark from '@/assets/icons/machine-to-machine-dark.svg?react';
import MachineToMachine from '@/assets/icons/machine-to-machine.svg?react';
import NativeAppDark from '@/assets/icons/native-app-dark.svg?react';
import NativeApp from '@/assets/icons/native-app.svg?react';
import ProtectedAppDark from '@/assets/icons/protected-app-dark.svg?react';
import ProtectedApp from '@/assets/icons/protected-app.svg?react';
import SinglePageAppDark from '@/assets/icons/single-page-app-dark.svg?react';
import SinglePageApp from '@/assets/icons/single-page-app.svg?react';
import TraditionalWebAppDark from '@/assets/icons/traditional-web-app-dark.svg?react';
import TraditionalWebApp from '@/assets/icons/traditional-web-app.svg?react';

type ApplicationIconMap = {
  [key in ApplicationType]: SvgComponent;
};

export const lightModeApplicationIconMap: ApplicationIconMap = Object.freeze({
  [ApplicationType.Native]: NativeApp,
  [ApplicationType.SPA]: SinglePageApp,
  [ApplicationType.Traditional]: TraditionalWebApp,
  [ApplicationType.MachineToMachine]: MachineToMachine,
  [ApplicationType.Protected]: ProtectedApp,
} as const);

export const darkModeApplicationIconMap: ApplicationIconMap = Object.freeze({
  [ApplicationType.Native]: NativeAppDark,
  [ApplicationType.SPA]: SinglePageAppDark,
  [ApplicationType.Traditional]: TraditionalWebAppDark,
  [ApplicationType.MachineToMachine]: MachineToMachineDark,
  [ApplicationType.Protected]: ProtectedAppDark,
} as const);

export { default as thirdPartyApplicationIconDark } from '@/assets/icons/third-party-app-dark.svg?react';

export { default as thirdPartyApplicationIcon } from '@/assets/icons/third-party-app.svg?react';
