import { useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { sendEmailVerificationCode, verifyEmailVerificationCode } from '@ac/apis/verification';

import CodeVerification, { type TranslationKeys } from '../CodeVerification';

type Props = {
  readonly onBack?: () => void;
  readonly onSwitchMethod?: () => void;
  readonly hasAlternativeMethod?: boolean;
};

const emailTranslationKeys: TranslationKeys = {
  title: 'account_center.email_verification.title',
  description: 'account_center.email_verification.description',
  prepareDescription: 'account_center.email_verification.prepare_description',
};

const EmailVerification = ({ onBack, onSwitchMethod, hasAlternativeMethod }: Props) => {
  const { userInfo } = useContext(PageContext);
  const email = userInfo?.primaryEmail;

  if (!email) {
    return null;
  }

  return (
    <CodeVerification
      identifier={email}
      codeInputName="emailCode"
      translationKeys={emailTranslationKeys}
      identifierLabelKey="account_center.email_verification.email_label"
      descriptionPropsBuilder={(value) => ({ email: value })}
      sendCode={sendEmailVerificationCode}
      verifyCode={async (accessToken, payload) =>
        verifyEmailVerificationCode(accessToken, {
          verificationRecordId: payload.verificationRecordId,
          code: payload.code,
          email: payload.identifier,
        })
      }
      hasAlternativeMethod={hasAlternativeMethod}
      onBack={onBack}
      onSwitchMethod={onSwitchMethod}
    />
  );
};

export default EmailVerification;
