import type { AdminConsoleKey } from '@logto/phrases';
import { Theme } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import CheckPreviewDark from '@/assets/icons/check-demo-dark.svg';
import CheckPreview from '@/assets/icons/check-demo.svg';
import CreateAppDark from '@/assets/icons/create-app-dark.svg';
import CreateApp from '@/assets/icons/create-app.svg';
import CreateRoleDark from '@/assets/icons/create-role-dark.svg';
import CreateRole from '@/assets/icons/create-role.svg';
import CustomizeDark from '@/assets/icons/customize-dark.svg';
import Customize from '@/assets/icons/customize.svg';
import DiscordDark from '@/assets/icons/discord-dark.svg';
import Discord from '@/assets/icons/discord.svg';
import FurtherReadingsDark from '@/assets/icons/further-readings-dark.svg';
import FurtherReadings from '@/assets/icons/further-readings.svg';
import MachineToMachineDark from '@/assets/icons/machine-to-machine-dark.svg';
import MachineToMachine from '@/assets/icons/machine-to-machine.svg';
import PasswordlessDark from '@/assets/icons/passwordless-dark.svg';
import Passwordless from '@/assets/icons/passwordless.svg';
import { discordLink } from '@/consts';
import { ConnectorsTabs } from '@/consts/page-tabs';
import { AppDataContext } from '@/contexts/AppDataProvider';
import useConfigs from '@/hooks/use-configs';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTheme from '@/hooks/use-theme';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';

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
  const { userEndpoint } = useContext(AppDataContext);
  const theme = useTheme();
  const isLightMode = theme === Theme.Light;
  const navigate = useNavigate();
  const { isBusinessPlan } = useUserOnboardingData();
  const { getDocumentationUrl } = useDocumentationUrl();

  const basicMetadata: GetStartedMetadata[] = useMemo(
    () => [
      {
        id: 'checkLivePreview',
        title: 'get_started.check_preview_title',
        subtitle: 'get_started.check_preview_subtitle',
        icon: isLightMode ? CheckPreview : CheckPreviewDark,
        buttonText: 'general.try_now',
        isComplete: configs?.livePreviewChecked,
        onClick: async () => {
          void updateConfigs({ livePreviewChecked: true });
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
    ],
    [
      configs?.applicationCreated,
      configs?.livePreviewChecked,
      configs?.passwordlessConfigured,
      configs?.signInExperienceCustomized,
      isLightMode,
      navigate,
      updateConfigs,
      userEndpoint,
    ]
  );

  const personalPlanMetadata: GetStartedMetadata[] = useMemo(
    () => [
      {
        id: 'joinCommunity',
        title: 'get_started.community_title',
        subtitle: 'get_started.community_subtitle',
        icon: isLightMode ? Discord : DiscordDark,
        buttonText: 'general.join',
        isComplete: configs?.communityChecked,
        onClick: () => {
          void updateConfigs({ communityChecked: true });
          window.open(discordLink, '_blank');
        },
      },
      {
        id: 'checkOutFurtherReadings',
        title: 'get_started.further_readings_title',
        subtitle: 'get_started.further_readings_subtitle',
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
    ],
    [
      configs?.communityChecked,
      configs?.furtherReadingsChecked,
      getDocumentationUrl,
      isLightMode,
      updateConfigs,
    ]
  );

  const businessPlanMetadata: GetStartedMetadata[] = useMemo(
    () => [
      {
        id: 'interactWithManagementAPI',
        title: 'get_started.management_api_title',
        subtitle: 'get_started.management_api_subtitle',
        icon: isLightMode ? MachineToMachine : MachineToMachineDark,
        buttonText: 'general.check_out',
        isComplete: configs?.m2mApplicationCreated,
        onClick: () => {
          navigate('/api-resources');
        },
      },
      {
        id: 'addRbac',
        title: 'get_started.add_rbac_title',
        subtitle: 'get_started.add_rbac_subtitle',
        icon: isLightMode ? CreateRole : CreateRoleDark,
        buttonText: 'general.check_out',
        isComplete: configs?.roleCreated,
        onClick: () => {
          navigate('/roles');
        },
      },
    ],
    [configs?.m2mApplicationCreated, configs?.roleCreated, isLightMode, navigate]
  );

  const data = useMemo(() => {
    const metadataItems: GetStartedMetadata[] = [
      ...basicMetadata,
      ...(isBusinessPlan ? businessPlanMetadata : personalPlanMetadata),
    ];

    return metadataItems.filter(({ isHidden }) => !isHidden);
  }, [basicMetadata, isBusinessPlan, businessPlanMetadata, personalPlanMetadata]);

  return {
    data,
    completedCount: data.filter(({ isComplete }) => isComplete).length,
    totalCount: data.length,
    isLoading: false,
  };
};

export default useGetStartedMetadata;
