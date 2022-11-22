import AuthenticationForm from './AuthenticationForm';
import LanguagesForm from './LanguagesForm';
import TermsForm from './TermsForm';

const Others = () => (
  <>
    <TermsForm />
    <LanguagesForm isManageLanguageVisible />
    <AuthenticationForm />
  </>
);

export default Others;
