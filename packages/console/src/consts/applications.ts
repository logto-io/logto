import { ApplicationType } from '@logto/schemas';

import MachineToMachineDark from '@/assets/icons/machine-to-machine-dark.svg';
import MachineToMachine from '@/assets/icons/machine-to-machine.svg';
import NativeAppDark from '@/assets/icons/native-app-dark.svg';
import NativeApp from '@/assets/icons/native-app.svg';
import ProtectedAppDark from '@/assets/icons/protected-app-dark.svg';
import ProtectedApp from '@/assets/icons/protected-app.svg';
import SinglePageAppDark from '@/assets/icons/single-page-app-dark.svg';
import SinglePageApp from '@/assets/icons/single-page-app.svg';
import TraditionalWebAppDark from '@/assets/icons/traditional-web-app-dark.svg';
import TraditionalWebApp from '@/assets/icons/traditional-web-app.svg';

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

export { default as thirdPartyApplicationIconDark } from '@/assets/icons/third-party-app-dark.svg';

export { default as thirdPartyApplicationIcon } from '@/assets/icons/third-party-app.svg';
