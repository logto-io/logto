import type { AdminConsoleKey } from '@logto/phrases';
import type { Application } from '@logto/schemas';
import { AppearanceMode } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

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
import { RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useSettings from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { getConnectorsPathname, getCreateApplicationPathname } from '@/utilities/router';

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
  const documentationUrl = useDocumentationUrl();
  const { settings, updateSettings } = useSettings();
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;
  const { data: demoApp, error } = useSWR<Application, RequestError>(
    `/api/applications/${demoAppApplicationId}`,
    {
      shouldRetryOnError: (error: unknown) => {
        if (error instanceof RequestError) {
          return error.status !== 404;
        }

        return true;
      },
    }
  );
  const navigate = useNavigate();
  const isLoadingDemoApp = !demoApp && !error;
  const hideDemo = error?.status === 404;

  const data = useMemo(() => {
    const metadataItems: GetStartedMetadata[] = [
      {
        id: 'checkDemo',
        title: 'get_started.card1_title',
        subtitle: 'get_started.card1_subtitle',
        icon: isLightMode ? CheckDemo : CheckDemoDark,
        buttonText: 'general.check_out',
        isComplete: settings?.demoChecked,
        isHidden: hideDemo,
        onClick: async () => {
          void updateSettings({ demoChecked: true });
          window.open('/demo-app', '_blank');
        },
      },
      {
        id: 'createApplication',
        title: 'get_started.card2_title',
        subtitle: 'get_started.card2_subtitle',
        icon: isLightMode ? CreateApp : CreateAppDark,
        buttonText: 'general.create',
        isComplete: settings?.applicationCreated,
        onClick: () => {
          navigate(getCreateApplicationPathname());
        },
      },
      {
        id: 'customizeSignInExperience',
        title: 'get_started.card3_title',
        subtitle: 'get_started.card3_subtitle',
        icon: isLightMode ? Customize : CustomizeDark,
        buttonText: 'general.customize',
        isComplete: settings?.signInExperienceCustomized,
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
        isComplete: settings?.passwordlessConfigured,
        onClick: () => {
          navigate(getConnectorsPathname(ConnectorsTabs.Passwordless));
        },
      },
      {
        id: 'configureSocialSignIn',
        title: 'get_started.card5_title',
        subtitle: 'get_started.card5_subtitle',
        icon: isLightMode ? Social : SocialDark,
        buttonText: 'general.add',
        isComplete: settings?.socialSignInConfigured,
        onClick: () => {
          navigate(getConnectorsPathname(ConnectorsTabs.Social));
        },
      },
      {
        id: 'checkFurtherReadings',
        title: 'get_started.card6_title',
        subtitle: 'get_started.card6_subtitle',
        icon: isLightMode ? FurtherReadings : FurtherReadingsDark,
        buttonText: 'general.check_out',
        isComplete: settings?.furtherReadingsChecked,
        onClick: () => {
          void updateSettings({ furtherReadingsChecked: true });
          window.open(`${documentationUrl}/docs/tutorials/get-started/further-readings/`, '_blank');
        },
      },
    ];

    return metadataItems.filter(({ isHidden }) => !isHidden);
  }, [
    documentationUrl,
    hideDemo,
    isLightMode,
    navigate,
    settings?.applicationCreated,
    settings?.demoChecked,
    settings?.furtherReadingsChecked,
    settings?.passwordlessConfigured,
    settings?.signInExperienceCustomized,
    settings?.socialSignInConfigured,
    updateSettings,
  ]);

  return {
    data,
    completedCount: data.filter(({ isComplete }) => isComplete).length,
    totalCount: data.length,
    isLoading: isLoadingDemoApp,
  };
};

export default useGetStartedMetadata;
