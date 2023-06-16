import type {
  CardSelectorOption,
  MultiCardSelectorOption,
} from '@/onboarding/components/CardSelector';

import { CompanySize, Reason, Title } from '../../types';

export const titleOptions: MultiCardSelectorOption[] = [
  { title: 'cloud.about.title_options.developer', value: Title.Developer },
  { title: 'cloud.about.title_options.team_lead', value: Title.TeamLead },
  { title: 'cloud.about.title_options.ceo', value: Title.Ceo },
  { title: 'cloud.about.title_options.cto', value: Title.Cto },
  { title: 'cloud.about.title_options.product', value: Title.Product },
  { title: 'cloud.about.title_options.others', value: Title.Others },
];

export const companySizeOptions: CardSelectorOption[] = [
  { title: 'cloud.about.company_options.size_1', value: CompanySize.Scale1 },
  { title: 'cloud.about.company_options.size_2_49', value: CompanySize.Scale2 },
  { title: 'cloud.about.company_options.size_50_199', value: CompanySize.Scale3 },
  { title: 'cloud.about.company_options.size_200_999', value: CompanySize.Scale4 },
  { title: 'cloud.about.company_options.size_1000_plus', value: CompanySize.Scale5 },
];

export const reasonOptions: MultiCardSelectorOption[] = [
  { title: 'cloud.about.reason_options.passwordless', value: Reason.Passwordless },
  { title: 'cloud.about.reason_options.efficiency', value: Reason.Efficiency },
  { title: 'cloud.about.reason_options.access_control', value: Reason.AccessControl },
  { title: 'cloud.about.reason_options.multi_tenancy', value: Reason.MultiTenancy },
  { title: 'cloud.about.reason_options.enterprise', value: Reason.Enterprise },
  { title: 'cloud.about.reason_options.others', value: Reason.Others },
];
