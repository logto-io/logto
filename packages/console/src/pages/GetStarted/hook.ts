import type { AdminConsoleKey } from '@logto/phrases';
import { AppearanceMode } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import CheckPreviewDark from '@/assets/images/check-demo-dark.svg';
import CheckPreview from '@/assets/images/check-demo.svg';
import CreateAppDark from '@/assets/images/create-app-dark.svg';
import CreateApp from '@/assets/images/create-app.svg';
import CustomizeDark from '@/assets/images/customize-dark.svg';
import Customize from '@/assets/images/customize.svg';
import DiscordDark from '@/assets/images/discord-dark.svg';
import Discord from '@/assets/images/discord.svg';
import GithubDark from '@/assets/images/github-dark.svg';
import Github from '@/assets/images/github.svg';
import MachineToMachineDark from '@/assets/images/machine-to-machine-dark.svg';
import MachineToMachine from '@/assets/images/machine-to-machine.svg';
import PasswordlessDark from '@/assets/images/passwordless-dark.svg';
import Passwordless from '@/assets/images/passwordless.svg';
import { discordLink, githubLink } from '@/consts';
import { isCloud } from '@/consts/cloud';
import { ConnectorsTabs } from '@/consts/page-tabs';
import { AppEndpointsContext } from '@/containers/AppEndpointsProvider';
import useConfigs from '@/hooks/use-configs';
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
  const { configs, updateConfigs } = useConfigs();
  const { userEndpoint } = useContext(AppEndpointsContext);
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;
  const navigate = useNavigate();

  const data = useMemo(() => {
    const metadataItems: GetStartedMetadata[] = [
      {
        id: 'checkLivePreview',
        title: 'get_started.check_preview_title',
        subtitle: 'get_started.check_preview_subtitle',
        icon: isLightMode ? CheckPreview : CheckPreviewDark,
        buttonText: 'general.try_now',
        isComplete: configs?.demoChecked,
        onClick: async () => {
          void updateConfigs({ demoChecked: true });
          window.open(new URL('/demo-app', userEndpoint), '_blank');
        },
      },
      {
        id: 'createApplication',
        title: 'get_started.integration_title',
        subtitle: 'get_started.integration_subtitle',
        icon: isLightMode ? CreateApp : CreateAppDark,
        buttonText: 'general.create',
        isComplete: configs?.applicationCreated,
        onClick: () => {
          navigate('/applications/create');
        },
      },
      {
        id: 'configurePasswordless',
        title: 'get_started.passwordless_title',
        subtitle: 'get_started.passwordless_subtitle',
        icon: isLightMode ? Passwordless : PasswordlessDark,
        buttonText: 'general.enable',
        isComplete: configs?.passwordlessConfigured,
        onClick: () => {
          navigate(`/connectors/${ConnectorsTabs.Passwordless}`);
        },
      },
      {
        id: 'customizeSignInExperience',
        title: 'get_started.custom_sie_title',
        subtitle: 'get_started.custom_sie_subtitle',
        icon: isLightMode ? Customize : CustomizeDark,
        buttonText: 'general.customize',
        isComplete: configs?.signInExperienceCustomized,
        onClick: () => {
          navigate('/sign-in-experience');
        },
      },
      isCloud
        ? {
            id: 'interactWithManagementAPI',
            title: 'get_started.management_api_title',
            subtitle: 'get_started.management_api_subtitle',
            icon: isLightMode ? MachineToMachine : MachineToMachineDark,
            buttonText: 'general.create',
            isComplete: configs?.socialSignInConfigured,
            onClick: () => {
              navigate('/applications/create');
            },
          }
        : {
            id: 'checkOutSelfHostingOptions',
            title: 'get_started.self_hosting_title',
            subtitle: 'get_started.self_hosting_subtitle',
            icon: isLightMode ? Github : GithubDark,
            buttonText: 'general.visit',
            isComplete: configs?.socialSignInConfigured,
            onClick: () => {
              // TODO @xiaoyijun update configs
              // void updateConfigs({ furtherReadingsChecked: true });
              window.open(githubLink, '_blank');
            },
          },
      {
        id: 'joinCommunity',
        title: 'get_started.community_title',
        subtitle: 'get_started.community_subtitle',
        icon: isLightMode ? Discord : DiscordDark,
        buttonText: 'general.join',
        isComplete: configs?.furtherReadingsChecked,
        onClick: () => {
          // TODO @xiaoyijun update configs
          // void updateConfigs({ furtherReadingsChecked: true });
          window.open(discordLink, '_blank');
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
  ]);

  return {
    data,
    completedCount: data.filter(({ isComplete }) => isComplete).length,
    totalCount: data.length,
    isLoading: false,
  };
};

export default useGetStartedMetadata;
