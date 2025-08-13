import { SignInIdentifier } from '@logto/schemas';

import VerificationCodeMfaBinding from '../VerificationCodeMfaBinding';

const PhoneMfaBinding = () => (
  <VerificationCodeMfaBinding
    identifierType={SignInIdentifier.Phone}
    titleKey="mfa.link_phone_verification_code_description"
    descriptionKey="mfa.link_phone_2fa_description"
    invalidInputErrorKey="invalid_phone"
  />
);

export default PhoneMfaBinding;
