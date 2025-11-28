import { SignInIdentifier } from '@logto/schemas';

import { updatePrimaryPhone } from '@ac/apis/account';
import { sendPhoneVerificationCode, verifyPhoneVerificationCode } from '@ac/apis/verification';

import IdentifierBindingPage from '../CodeFlow/IdentifierBindingPage';

const Phone = () => (
  <IdentifierBindingPage
    identifierType={SignInIdentifier.Phone}
    accountField="phone"
    sendStep={{
      titleKey: 'account_center.phone.title',
      descriptionKey: 'account_center.phone.description',
      inputLabelKey: 'account_center.phone_verification.phone_label',
      buttonTitleKey: 'account_center.phone_verification.send',
      inputName: 'phone',
    }}
    verifyStep={{
      titleKey: 'account_center.phone.verification_title',
      descriptionKey: 'account_center.phone.verification_description',
      descriptionPropsBuilder: (identifier) => ({ phone_number: identifier }),
      codeInputName: 'phoneCode',
      resendKey: 'account_center.phone_verification.resend',
      resendCountdownKey: 'account_center.phone_verification.resend_countdown',
    }}
    mismatchErrorCode="verification_code.phone_mismatch"
    sendCode={sendPhoneVerificationCode}
    verifyCode={verifyPhoneVerificationCode}
    buildVerifyPayload={(identifier, verificationRecordId, code) => ({
      verificationRecordId,
      code,
      phone: identifier,
    })}
    bindIdentifier={updatePrimaryPhone}
    buildBindPayload={(identifier, newIdentifierVerificationRecordId) => ({
      phone: identifier,
      newIdentifierVerificationRecordId,
    })}
  />
);

export default Phone;
