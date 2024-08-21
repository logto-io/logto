import { AgreeToTermsPolicy, experience, SignInMode } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import FocusedAuthPageLayout from '@/Layout/FocusedAuthPageLayout';
import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import IdentifierRegisterForm from '@/components/IdentifierRegisterForm';
import { useSieMethods } from '@/hooks/use-sie';
import { identifierInputDescriptionMap } from '@/utils/form';

import useIdentifierSignUpMethods from './use-identifier-sign-up-methods';

const IdentifierRegister = () => {
  const { t } = useTranslation();
  const signUpMethods = useIdentifierSignUpMethods();
  const { signInMode } = useSieMethods();

  /**
   * Fallback to sign-in page in the following cases:
   * - Sign-in mode is set to `SignIn` (user registration is not enabled in the sign-in experience configuration)
   * - No sign up methods are available
   */
  if (signInMode === SignInMode.SignIn || signUpMethods.length === 0) {
    return <Navigate to={`/${experience.routes.signIn}`} />;
  }

  return (
    <FocusedAuthPageLayout
      pageMeta={{ titleKey: 'description.create_your_account' }}
      title="description.create_account"
      description={t('description.identifier_register_description', {
        types: signUpMethods.map((identifier) => t(identifierInputDescriptionMap[identifier])),
      })}
      footerTermsDisplayPolicies={[AgreeToTermsPolicy.Automatic]}
      authOptionsLink={{
        to: `/${experience.routes.register}`,
        text: 'description.all_account_creation_options',
      }}
    >
      <SingleSignOnFormModeContextProvider>
        <IdentifierRegisterForm signUpMethods={signUpMethods} />
      </SingleSignOnFormModeContextProvider>
    </FocusedAuthPageLayout>
  );
};

export default IdentifierRegister;
