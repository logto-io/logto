import { AgreeToTermsPolicy, experience } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import IdentifierPageLayout from '@/Layout/IdentifierPageLayout';
import { identifierInputDescriptionMap } from '@/utils/form';

import IdentifierSignInForm from '../SignIn/IdentifierSignInForm';
import PasswordSignInForm from '../SignIn/PasswordSignInForm';

import useIdentifierSignInMethods from './use-identifier-sign-in-methods';

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
    <IdentifierPageLayout
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
      {isPasswordOnly ? (
        <PasswordSignInForm signInMethods={signInMethods.map(({ identifier }) => identifier)} />
      ) : (
        <IdentifierSignInForm signInMethods={signInMethods} />
      )}
    </IdentifierPageLayout>
  );
};

export default IdentifierSignIn;
