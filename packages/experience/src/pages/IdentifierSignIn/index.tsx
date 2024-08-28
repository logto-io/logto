import { AgreeToTermsPolicy, experience } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import FocusedAuthPageLayout from '@/Layout/FocusedAuthPageLayout';
import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import IdentifierSignInForm from '@/components/IdentifierSignInForm';
import PasswordSignInForm from '@/components/PasswordSignInForm';
import { identifierInputDescriptionMap } from '@/utils/form';

import useIdentifierSignInMethods from './use-identifier-sign-in-methods';

/**
 * Identifier sign-in page
 *
 * This page is used to display specific identifier-based sign-in methods to users.
 *
 * This page can be used as the first screen of the authentication flow,
 * and can be configured by setting the `first_screen` parameter to `identifier:sign_in`
 * in the authentication URL.
 *
 * identifiers used in this page can be configured by setting the `identifier` parameter
 * in the authentication URL, multiple identifiers can be separated by space.
 */
const IdentifierSignIn = () => {
  const { t } = useTranslation();

  const signInMethods = useIdentifierSignInMethods();

  const isPasswordOnly = useMemo(
    () =>
      signInMethods.length > 0 &&
      signInMethods.every(({ password, verificationCode }) => password && !verificationCode),
    [signInMethods]
  );

  // Fallback to sign-in page if no sign-in methods are available
  if (signInMethods.length === 0) {
    return <Navigate to={`/${experience.routes.signIn}`} />;
  }

  return (
    <FocusedAuthPageLayout
      pageMeta={{ titleKey: 'description.sign_in' }}
      title="description.sign_in"
      description={t('description.identifier_sign_in_description', {
        types: signInMethods.map(({ identifier }) => t(identifierInputDescriptionMap[identifier])),
      })}
      footerTermsDisplayPolicies={[
        AgreeToTermsPolicy.Automatic,
        AgreeToTermsPolicy.ManualRegistrationOnly,
      ]}
      authOptionsLink={{
        to: `/${experience.routes.signIn}`,
        text: 'description.all_sign_in_options',
      }}
    >
      <SingleSignOnFormModeContextProvider>
        {isPasswordOnly ? (
          <PasswordSignInForm signInMethods={signInMethods.map(({ identifier }) => identifier)} />
        ) : (
          <IdentifierSignInForm signInMethods={signInMethods} />
        )}
      </SingleSignOnFormModeContextProvider>
    </FocusedAuthPageLayout>
  );
};

export default IdentifierSignIn;
