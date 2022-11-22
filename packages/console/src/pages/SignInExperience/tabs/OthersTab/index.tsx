import AuthenticationForm from './AuthenticationForm';
import LanguagesForm from './LanguagesForm';
import TermsForm from './TermsForm';

const OthersTab = () => (
  <>
    <TermsForm />
    <LanguagesForm isManageLanguageVisible />
    <AuthenticationForm />
  </>
);

export default OthersTab;
