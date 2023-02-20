import Building from '@/assets/images/building.svg';
import Cloud from '@/assets/images/cloud.svg';
import Database from '@/assets/images/database.svg';
import Pizza from '@/assets/images/pizza.svg';
import type { Option as SelectorOption } from '@/cloud/components/CardSelector';

import { DeploymentType, Project } from '../../types';

export const projectOptions: SelectorOption[] = [
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

export const deploymentTypeOptions: SelectorOption[] = [
  {
    icon: <Database />,
    title: 'cloud.welcome.deployment_type_options.opensource',
    value: DeploymentType.Opensource,
  },
  {
    icon: <Cloud />,
    title: 'cloud.welcome.deployment_type_options.cloud',
    value: DeploymentType.Cloud,
  },
];
