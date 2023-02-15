import Building from '@/assets/images/building.svg';
import Cloud from '@/assets/images/cloud.svg';
import Database from '@/assets/images/database.svg';
import Pizza from '@/assets/images/pizza.svg';
import type { Option as SelectorOption } from '@/pages/CloudPreview/components/CardSelector';

import { DeploymentType, Project } from '../../types';

export const projectOptions: SelectorOption[] = [
  {
    icon: <Pizza />,
    title: 'cloud_preview.welcome.project_personal',
    value: Project.Personal,
  },
  {
    icon: <Building />,
    title: 'cloud_preview.welcome.project_company',
    value: Project.Company,
  },
];

export const deploymentTypeOptions: SelectorOption[] = [
  {
    icon: <Database />,
    title: 'cloud_preview.welcome.deployment_type_opensource',
    value: DeploymentType.Opensource,
  },
  {
    icon: <Cloud />,
    title: 'cloud_preview.welcome.deployment_type_cloud',
    value: DeploymentType.Cloud,
  },
];
