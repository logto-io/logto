import { SignInIdentifier } from '@logto/schemas';

import VerificationCodeMfaBinding from '../VerificationCodeMfaBinding';

const EmailMfaBinding = () => (
  <VerificationCodeMfaBinding
    identifierType={SignInIdentifier.Email}
    titleKey="mfa.link_email_verification_code_description"
    descriptionKey="mfa.link_email_2fa_description"
    invalidInputErrorKey="invalid_email"
  />
);

export default EmailMfaBinding;
