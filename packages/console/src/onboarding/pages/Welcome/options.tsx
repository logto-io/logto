import Building from '@/assets/icons/building.svg';
import Pizza from '@/assets/icons/pizza.svg';
import type {
  CardSelectorOption,
  MultiCardSelectorOption,
} from '@/onboarding/components/CardSelector';

import { Project, CompanySize, Reason, Title } from '../../types';

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

export const titleOptions: MultiCardSelectorOption[] = [
  { title: 'cloud.welcome.title_options.developer', value: Title.Developer },
  { title: 'cloud.welcome.title_options.team_lead', value: Title.TeamLead },
  { title: 'cloud.welcome.title_options.ceo', value: Title.Ceo },
  { title: 'cloud.welcome.title_options.cto', value: Title.Cto },
  { title: 'cloud.welcome.title_options.product', value: Title.Product },
  { title: 'cloud.welcome.title_options.others', value: Title.Others },
];

export const companySizeOptions: CardSelectorOption[] = [
  { title: 'cloud.welcome.company_options.size_1', value: CompanySize.Scale1 },
  { title: 'cloud.welcome.company_options.size_2_49', value: CompanySize.Scale2 },
  { title: 'cloud.welcome.company_options.size_50_199', value: CompanySize.Scale3 },
  { title: 'cloud.welcome.company_options.size_200_999', value: CompanySize.Scale4 },
  { title: 'cloud.welcome.company_options.size_1000_plus', value: CompanySize.Scale5 },
];

export const reasonOptions: MultiCardSelectorOption[] = [
  { title: 'cloud.welcome.reason_options.passwordless', value: Reason.Passwordless },
  { title: 'cloud.welcome.reason_options.efficiency', value: Reason.Efficiency },
  { title: 'cloud.welcome.reason_options.access_control', value: Reason.AccessControl },
  { title: 'cloud.welcome.reason_options.multi_tenancy', value: Reason.MultiTenancy },
  { title: 'cloud.welcome.reason_options.enterprise', value: Reason.Enterprise },
  { title: 'cloud.welcome.reason_options.others', value: Reason.Others },
];
