import PageMeta from '@/components/PageMeta';

import SignInExperienceTabWrapper from '../components/SignInExperienceTabWrapper';

import LanguagesForm from './LanguagesForm';
import TermsForm from './TermsForm';

type Props = {
  readonly isActive: boolean;
};

function Content({ isActive }: Props) {
  return (
    <SignInExperienceTabWrapper isActive={isActive}>
      {isActive && <PageMeta titleKey={['sign_in_exp.tabs.content', 'sign_in_exp.page_title']} />}
      <TermsForm />
      <LanguagesForm isManageLanguageVisible />
    </SignInExperienceTabWrapper>
  );
}

export default Content;
