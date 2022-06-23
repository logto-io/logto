import { AppearanceMode, ApplicationType } from '@logto/schemas';
import React from 'react';

import NativeAppDark from '@/assets/images/native-app-dark.svg';
import NativeApp from '@/assets/images/native-app.svg';
import SinglePageAppDark from '@/assets/images/single-page-app-dark.svg';
import SinglePageApp from '@/assets/images/single-page-app.svg';
import TraditionalWebAppDark from '@/assets/images/traditional-web-app-dark.svg';
import TraditionalWebApp from '@/assets/images/traditional-web-app.svg';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  type: ApplicationType;
};

const ApplicationIcon = ({ type }: Props) => {
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;

  switch (type) {
    case ApplicationType.Native:
      return isLightMode ? <NativeApp /> : <NativeAppDark />;
    case ApplicationType.SPA:
      return isLightMode ? <SinglePageApp /> : <SinglePageAppDark />;
    case ApplicationType.Traditional:
      return isLightMode ? <TraditionalWebApp /> : <TraditionalWebAppDark />;
    default:
      return null;
  }
};

export default ApplicationIcon;
