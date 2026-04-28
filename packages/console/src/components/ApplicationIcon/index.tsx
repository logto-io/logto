import { ApplicationType, Theme } from '@logto/schemas';

import {
  darkModeApplicationIconMap,
  deviceFlowApplicationIcon,
  deviceFlowApplicationIconDark,
  lightModeApplicationIconMap,
  thirdPartyApplicationIcon,
  thirdPartyApplicationIconDark,
} from '@/consts';
import useTheme from '@/hooks/use-theme';

type Props = {
  readonly type: ApplicationType;
  readonly className?: string;
  readonly isThirdParty?: boolean;
  readonly isDeviceFlow?: boolean;
};

const getIcon = (
  type: ApplicationType,
  isLightMode: boolean,
  isThirdParty?: boolean,
  isDeviceFlow?: boolean
) => {
  // We have ensured that SAML applications are always third party in DB schema, we use `||` here to make TypeScript happy.
  // TODO: @darcy fix this when SAML application <Icon /> is ready
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (isThirdParty || type === ApplicationType.SAML) {
    return isLightMode ? thirdPartyApplicationIcon : thirdPartyApplicationIconDark;
  }

  if (isDeviceFlow && type === ApplicationType.Native) {
    return isLightMode ? deviceFlowApplicationIcon : deviceFlowApplicationIconDark;
  }

  return isLightMode ? lightModeApplicationIconMap[type] : darkModeApplicationIconMap[type];
};

function ApplicationIcon({ type, className, isThirdParty = false, isDeviceFlow = false }: Props) {
  const theme = useTheme();
  const isLightMode = theme === Theme.Light;
  const Icon = getIcon(type, isLightMode, isThirdParty, isDeviceFlow);

  return <Icon className={className} />;
}

export default ApplicationIcon;
