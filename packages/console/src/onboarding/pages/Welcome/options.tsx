import Building from '@/assets/images/building.svg';
import Cloud from '@/assets/images/cloud.svg';
import Database from '@/assets/images/database.svg';
import Pizza from '@/assets/images/pizza.svg';
import type { CardSelectorOption } from '@/onboarding/components/CardSelector';

import { DeploymentType, Project } from '../../types';

export const projectOptions: CardSelectorOption[] = [
  {
    icon: <Pizza />,
    title: 'cloud.welcome.project_options.personal',
    value: Project.Personal,
  },
  {
    icon: <Building />,
    title: 'cloud.welcome.project_options.company',
    value: Project.Company,
  },
];

export const deploymentTypeOptions: CardSelectorOption[] = [
  {
    icon: <Database />,
    title: 'cloud.welcome.deployment_type_options.open_source',
    value: DeploymentType.OpenSource,
  },
  {
    icon: <Cloud />,
    title: 'cloud.welcome.deployment_type_options.cloud',
    value: DeploymentType.Cloud,
  },
];
