import { AdditionalFeatures, Project, Stage } from '@logto/schemas';

import Building from '@/assets/icons/building.svg?react';
import Pizza from '@/assets/icons/pizza.svg?react';
import type {
  CardSelectorOption,
  MultiCardSelectorOption,
} from '@/onboarding/components/CardSelector';

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

export const stageOptions: CardSelectorOption[] = [
  { title: 'cloud.welcome.stage_options.new_product', value: Stage.NewProduct },
  { title: 'cloud.welcome.stage_options.existing_product', value: Stage.ExistingProduct },
  {
    title: 'cloud.welcome.stage_options.target_enterprise_ready',
    value: Stage.TargetEnterpriseReady,
  },
];

export const additionalFeaturesOptions: MultiCardSelectorOption[] = [
  {
    title: 'cloud.welcome.additional_features_options.customize_ui_and_flow',
    value: AdditionalFeatures.CustomizeUiAndFlow,
  },
  {
    title: 'cloud.welcome.additional_features_options.compliance',
    value: AdditionalFeatures.Compliance,
  },
  {
    title: 'cloud.welcome.additional_features_options.export_user_data',
    value: AdditionalFeatures.ExportUserDataFromLogto,
  },
  {
    title: 'cloud.welcome.additional_features_options.budget_control',
    value: AdditionalFeatures.BudgetControl,
  },
  {
    title: 'cloud.welcome.additional_features_options.bring_own_auth',
    value: AdditionalFeatures.BringOwnAuth,
  },
  { title: 'cloud.welcome.additional_features_options.others', value: AdditionalFeatures.Others },
];
