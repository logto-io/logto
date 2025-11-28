import { SignInIdentifier } from '@logto/schemas';

import { updatePrimaryEmail } from '@ac/apis/account';
import { sendEmailVerificationCode, verifyEmailVerificationCode } from '@ac/apis/verification';

import IdentifierBindingPage from '../CodeFlow/IdentifierBindingPage';

const Email = () => (
  <IdentifierBindingPage
    identifierType={SignInIdentifier.Email}
    accountField="email"
    sendStep={{
      titleKey: 'account_center.email.title',
      descriptionKey: 'account_center.email.description',
      inputLabelKey: 'account_center.email_verification.email_label',
      buttonTitleKey: 'account_center.email_verification.send',
      inputName: 'email',
    }}
    verifyStep={{
      titleKey: 'account_center.email.verification_title',
      descriptionKey: 'account_center.email.verification_description',
      descriptionPropsBuilder: (identifier) => ({ email_address: identifier }),
      codeInputName: 'emailCode',
      resendKey: 'account_center.email_verification.resend',
      resendCountdownKey: 'account_center.email_verification.resend_countdown',
    }}
    mismatchErrorCode="verification_code.email_mismatch"
    sendCode={sendEmailVerificationCode}
    verifyCode={verifyEmailVerificationCode}
    buildVerifyPayload={(identifier, verificationRecordId, code) => ({
      verificationRecordId,
      code,
      email: identifier,
    })}
    bindIdentifier={updatePrimaryEmail}
    buildBindPayload={(identifier, newIdentifierVerificationRecordId) => ({
      email: identifier,
      newIdentifierVerificationRecordId,
    })}
  />
);

export default Email;
