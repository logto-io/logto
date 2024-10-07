import { experience } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import FocusedAuthPageLayout from '@/Layout/FocusedAuthPageLayout';
import usePrefilledIdentifier from '@/hooks/use-prefilled-identifier';
import { identifierInputDescriptionMap } from '@/utils/form';

import ForgotPasswordForm from '../ForgotPassword/ForgotPasswordForm';

import { useResetPasswordMethods } from './use-reset-password-methods';

/**
 * ResetPasswordLanding Component
 *
 * This is a specialized "first screen" page dedicated to the password reset process,
 * distinct from the password reset step in the regular login flow.
 * As the entry point for the password reset flow, it allows users to initiate
 * the password reset process directly.
 *
 * Developers can specify this page as the initial screen of the user's login flow
 * by setting the `first_screen=reset_password` parameter in the authentication flow.
 *
 * Typical use cases include:
 * 1. When system administrators create accounts for new users and require them
 *    to update their password upon first login.
 * 2. When users initiate an authentication flow with reset password as the first screen
 *    by clicking a link in a password reset email.
 *
 * This approach ensures that users can seamlessly enter the password reset flow
 * in specific scenarios, enhancing both user experience and account security.
 */
const ResetPasswordLanding = () => {
  const { t } = useTranslation();
  const enabledMethods = useResetPasswordMethods();
  const { value: prefilledValue } = usePrefilledIdentifier({
    enabledIdentifiers: enabledMethods,
    isForgotPassword: true,
  });

  // Fallback to sign-in page
  if (enabledMethods.length === 0) {
    return <Navigate to={`/${experience.routes.signIn}`} />;
  }

  return (
    <FocusedAuthPageLayout
      pageMeta={{
        titleKey: 'description.reset_password',
      }}
      title="description.reset_password"
      description={t('description.reset_password_description', {
        types: enabledMethods.map((method) => t(identifierInputDescriptionMap[method])),
      })}
      authOptionsLink={{
        to: `/${experience.routes.signIn}`,
        text: 'description.back_to_sign_in',
      }}
    >
      <ForgotPasswordForm autoFocus defaultValue={prefilledValue} enabledTypes={enabledMethods} />
    </FocusedAuthPageLayout>
  );
};

export default ResetPasswordLanding;
