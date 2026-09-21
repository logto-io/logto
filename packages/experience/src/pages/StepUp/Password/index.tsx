import { VerificationType } from '@logto/schemas';

import VerificationPageLayout from '@/Layout/VerificationPageLayout';
import useStepUpContext from '@/hooks/use-step-up-context';
import ErrorPage from '@/pages/ErrorPage';

import PasswordForm from './PasswordForm';

/**
 * `/step-up/password`: verify the pinned subject's password.
 *
 * The guard has already loaded the authentication context, so this page only has to check that
 * Core still offers the password: reaching it otherwise (a stale link, a method removed
 * mid-flow) is an invalid session, not a form to fill in. A sign-in with requested ACR arrives
 * here through the landing, which `session.step_up.require_verification` navigates to.
 */
const Password = () => {
  const { authenticationContext } = useStepUpContext();

  if (!authenticationContext?.availableMethods.includes(VerificationType.Password)) {
    return <ErrorPage message="error.invalid_session" />;
  }

  return (
    <VerificationPageLayout
      title="step_up.verify_your_identity"
      description="step_up.enter_password_description"
    >
      <PasswordForm />
    </VerificationPageLayout>
  );
};

export default Password;
