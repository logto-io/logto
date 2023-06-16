import Building from '@/assets/icons/building.svg';
import Cloud from '@/assets/icons/cloud.svg';
import Database from '@/assets/icons/database.svg';
import Pizza from '@/assets/icons/pizza.svg';
import type { CardSelectorOption } from '@/components/CardSelector';

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
