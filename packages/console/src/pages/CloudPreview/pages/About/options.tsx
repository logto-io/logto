import type { Option as SelectorOption } from '@/pages/CloudPreview/components/CardSelector';

import { CompanySize, Reason, Title } from '../../types';

export const titleOptions: SelectorOption[] = [
  { title: 'cloud_preview.about.title_developer', value: Title.Developer },
  { title: 'cloud_preview.about.title_team_lead', value: Title.TeamLead },
  { title: 'cloud_preview.about.title_ceo', value: Title.Ceo },
  { title: 'cloud_preview.about.title_cto', value: Title.Cto },
  { title: 'cloud_preview.about.title_product', value: Title.Product },
  { title: 'cloud_preview.about.title_others', value: Title.Others },
];

export const companySizeOptions: SelectorOption[] = [
  { title: 'cloud_preview.about.company_size_1', value: CompanySize.Scale1 },
  { title: 'cloud_preview.about.company_size_1_49', value: CompanySize.Scale2 },
  { title: 'cloud_preview.about.company_size_50_199', value: CompanySize.Scale3 },
  { title: 'cloud_preview.about.company_size_200_999', value: CompanySize.Scale4 },
  { title: 'cloud_preview.about.company_size_1000_plus', value: CompanySize.Scale5 },
];

export const reasonOptions: SelectorOption[] = [
  { title: 'cloud_preview.about.reason_adoption', value: Reason.Adoption },
  { title: 'cloud_preview.about.reason_replacement', value: Reason.Replacement },
  { title: 'cloud_preview.about.reason_evaluation', value: Reason.Evaluation },
  { title: 'cloud_preview.about.reason_experimentation', value: Reason.Experimentation },
  { title: 'cloud_preview.about.reason_aesthetics', value: Reason.Aesthetics },
  { title: 'cloud_preview.about.reason_others', value: Reason.Others },
];
