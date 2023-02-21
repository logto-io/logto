import type { AdminConsoleKey } from '@logto/phrases';
import { AppearanceMode } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import CheckDemoDark from '@/assets/images/check-demo-dark.svg';
import CheckDemo from '@/assets/images/check-demo.svg';
import CreateAppDark from '@/assets/images/create-app-dark.svg';
import CreateApp from '@/assets/images/create-app.svg';
import CustomizeDark from '@/assets/images/customize-dark.svg';
import Customize from '@/assets/images/customize.svg';
import FurtherReadingsDark from '@/assets/images/further-readings-dark.svg';
import FurtherReadings from '@/assets/images/further-readings.svg';
import PasswordlessDark from '@/assets/images/passwordless-dark.svg';
import Passwordless from '@/assets/images/passwordless.svg';
import SocialDark from '@/assets/images/social-dark.svg';
import Social from '@/assets/images/social.svg';
import { ConnectorsTabs } from '@/consts/page-tabs';
import { AppEndpointsContext } from '@/containers/AppEndpointsProvider';
import useConfigs from '@/hooks/use-configs';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { useTheme } from '@/hooks/use-theme';

type GetStartedMetadata = {
  id: string;
  title: AdminConsoleKey;
  subtitle: AdminConsoleKey;
  icon: SvgComponent;
  buttonText: AdminConsoleKey;
  isComplete?: boolean;
  isHidden?: boolean;
  onClick: () => void;
};

const useGetStartedMetadata = () => {
  const { getDocumentationUrl } = useDocumentationUrl();
  const { configs, updateConfigs } = useConfigs();
  const { userEndpoint } = useContext(AppEndpointsContext);
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;
  const navigate = useNavigate();

  const data = useMemo(() => {
    const metadataItems: GetStartedMetadata[] = [
      {
        id: 'checkDemo',
        title: 'get_started.card1_title',
        subtitle: 'get_started.card1_subtitle',
        icon: isLightMode ? CheckDemo : CheckDemoDark,
        buttonText: 'general.check_out',
        isComplete: configs?.demoChecked,
        onClick: async () => {
          void updateConfigs({ demoChecked: true });
          window.open(new URL('/demo-app', userEndpoint), '_blank');
        },
      },
      {
        id: 'createApplication',
        title: 'get_started.card2_title',
        subtitle: 'get_started.card2_subtitle',
        icon: isLightMode ? CreateApp : CreateAppDark,
        buttonText: 'general.create',
        isComplete: configs?.applicationCreated,
        onClick: () => {
          navigate('/applications/create');
        },
      },
      {
        id: 'customizeSignInExperience',
        title: 'get_started.card3_title',
        subtitle: 'get_started.card3_subtitle',
        icon: isLightMode ? Customize : CustomizeDark,
        buttonText: 'general.customize',
        isComplete: configs?.signInExperienceCustomized,
        onClick: () => {
          navigate('/sign-in-experience');
        },
      },
      {
        id: 'configurePasswordless',
        title: 'get_started.card4_title',
        subtitle: 'get_started.card4_subtitle',
        icon: isLightMode ? Passwordless : PasswordlessDark,
        buttonText: 'general.set_up',
        isComplete: configs?.passwordlessConfigured,
        onClick: () => {
          navigate(`/connectors/${ConnectorsTabs.Passwordless}`);
        },
      },
      {
        id: 'configureSocialSignIn',
        title: 'get_started.card5_title',
        subtitle: 'get_started.card5_subtitle',
        icon: isLightMode ? Social : SocialDark,
        buttonText: 'general.add',
        isComplete: configs?.socialSignInConfigured,
        onClick: () => {
          navigate(`/connectors/${ConnectorsTabs.Social}`);
        },
      },
      {
        id: 'checkFurtherReadings',
        title: 'get_started.card6_title',
        subtitle: 'get_started.card6_subtitle',
        icon: isLightMode ? FurtherReadings : FurtherReadingsDark,
        buttonText: 'general.check_out',
        isComplete: configs?.furtherReadingsChecked,
        onClick: () => {
          void updateConfigs({ furtherReadingsChecked: true });
          window.open(
            getDocumentationUrl('/docs/tutorials/get-started/further-readings'),
            '_blank'
          );
        },
      },
    ];

    return metadataItems.filter(({ isHidden }) => !isHidden);
  }, [
    isLightMode,
    configs?.demoChecked,
    configs?.applicationCreated,
    configs?.signInExperienceCustomized,
    configs?.passwordlessConfigured,
    configs?.socialSignInConfigured,
    configs?.furtherReadingsChecked,
    updateConfigs,
    userEndpoint,
    navigate,
    getDocumentationUrl,
  ]);

  return {
    data,
    completedCount: data.filter(({ isComplete }) => isComplete).length,
    totalCount: data.length,
    isLoading: false,
  };
};

export default useGetStartedMetadata;
