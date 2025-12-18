import { formatPhoneNumberWithCountryCallingCode } from '@experience/utils/country-code';
import { useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { sendPhoneVerificationCode, verifyPhoneVerificationCode } from '@ac/apis/verification';

import CodeVerification, { type TranslationKeys } from '../CodeVerification';

type Props = {
  readonly onBack?: () => void;
  readonly onSwitchMethod?: () => void;
  readonly hasAlternativeMethod?: boolean;
};

const phoneTranslationKeys: TranslationKeys = {
  title: 'account_center.phone_verification.title',
  description: 'account_center.phone_verification.description',
  prepareDescription: 'account_center.phone_verification.prepare_description',
};

const PhoneVerification = ({ onBack, onSwitchMethod, hasAlternativeMethod }: Props) => {
  const { userInfo } = useContext(PageContext);
  const phone = userInfo?.primaryPhone;

  if (!phone) {
    return null;
  }

  return (
    <CodeVerification
      identifier={phone}
      codeInputName="phoneCode"
      translationKeys={phoneTranslationKeys}
      identifierLabelKey="account_center.phone_verification.phone_label"
      descriptionPropsBuilder={(value) => ({
        phone: formatPhoneNumberWithCountryCallingCode(value),
      })}
      sendCode={sendPhoneVerificationCode}
      verifyCode={async (accessToken, payload) =>
        verifyPhoneVerificationCode(accessToken, {
          verificationRecordId: payload.verificationRecordId,
          code: payload.code,
          phone: payload.identifier,
        })
      }
      hasAlternativeMethod={hasAlternativeMethod}
      onBack={onBack}
      onSwitchMethod={onSwitchMethod}
    />
  );
};

export default PhoneVerification;
