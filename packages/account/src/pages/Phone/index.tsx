import { formatPhoneNumberWithCountryCallingCode } from '@experience/utils/country-code';
import { SignInIdentifier } from '@logto/schemas';

import { updatePrimaryPhone } from '@ac/apis/account';
import { sendPhoneVerificationCode, verifyPhoneVerificationCode } from '@ac/apis/verification';
import { phoneSuccessRoute } from '@ac/constants/routes';

import IdentifierBindingPage from '../CodeFlow/IdentifierBindingPage';

const Phone = () => (
  <IdentifierBindingPage
    identifierType={SignInIdentifier.Phone}
    accountField="phone"
    sendStep={{
      titleKey: 'account_center.phone.title',
      descriptionKey: 'account_center.phone.description',
      inputLabelKey: 'account_center.phone_verification.phone_label',
      inputName: 'phone',
    }}
    verifyStep={{
      titleKey: 'account_center.phone.verification_title',
      descriptionKey: 'account_center.phone.verification_description',
      descriptionPropsBuilder: (identifier) => ({
        phone_number: formatPhoneNumberWithCountryCallingCode(identifier),
      }),
      codeInputName: 'phoneCode',
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
    successRedirect={phoneSuccessRoute}
  />
);

export default Phone;
