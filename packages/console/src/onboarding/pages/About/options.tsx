import type { Option as SelectorOption } from '@/onboarding/components/CardSelector';

import { CompanySize, Reason, Title } from '../../types';

export const titleOptions: SelectorOption[] = [
  { title: 'cloud.about.title_options.developer', value: Title.Developer },
  { title: 'cloud.about.title_options.team_lead', value: Title.TeamLead },
  { title: 'cloud.about.title_options.ceo', value: Title.Ceo },
  { title: 'cloud.about.title_options.cto', value: Title.Cto },
  { title: 'cloud.about.title_options.product', value: Title.Product },
  { title: 'cloud.about.title_options.others', value: Title.Others },
];

export const companySizeOptions: SelectorOption[] = [
  { title: 'cloud.about.company_options.size_1', value: CompanySize.Scale1 },
  { title: 'cloud.about.company_options.size_1_49', value: CompanySize.Scale2 },
  { title: 'cloud.about.company_options.size_50_199', value: CompanySize.Scale3 },
  { title: 'cloud.about.company_options.size_200_999', value: CompanySize.Scale4 },
  { title: 'cloud.about.company_options.size_1000_plus', value: CompanySize.Scale5 },
];

export const reasonOptions: SelectorOption[] = [
  { title: 'cloud.about.reason_options.adoption', value: Reason.Adoption },
  { title: 'cloud.about.reason_options.replacement', value: Reason.Replacement },
  { title: 'cloud.about.reason_options.evaluation', value: Reason.Evaluation },
  { title: 'cloud.about.reason_options.experimentation', value: Reason.Experimentation },
  { title: 'cloud.about.reason_options.aesthetics', value: Reason.Aesthetics },
  { title: 'cloud.about.reason_options.others', value: Reason.Others },
];
