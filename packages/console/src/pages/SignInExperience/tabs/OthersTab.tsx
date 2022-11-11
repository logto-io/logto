import AuthenticationForm from '../components/AuthenticationForm';
import LanguagesForm from '../components/LanguagesForm';
import TermsForm from '../components/TermsForm';

const OthersTab = () => (
  <>
    <TermsForm />
    <LanguagesForm isManageLanguageVisible />
    <AuthenticationForm />
  </>
);

export default OthersTab;
