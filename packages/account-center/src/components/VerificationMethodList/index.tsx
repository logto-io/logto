import { useContext, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';
import { VerificationMethod } from '@ac/types';

import EmailVerification from '../EmailVerification';
import PasswordVerification from '../PasswordVerification';
import PhoneVerification from '../PhoneVerification';
import VerificationMethodButton from '../VerificationMethodButton';

const VerificationMethodList = () => {
  const { userInfo } = useContext(PageContext);
  const [verifyingMethod, setVerifyingMethod] = useState<VerificationMethod>();

  if (verifyingMethod === VerificationMethod.Password) {
    return (
      <PasswordVerification
        onBack={() => {
          setVerifyingMethod(undefined);
        }}
      />
    );
  }

  if (verifyingMethod === VerificationMethod.EmailCode) {
    return (
      <EmailVerification
        onBack={() => {
          setVerifyingMethod(undefined);
        }}
      />
    );
  }

  if (verifyingMethod === VerificationMethod.PhoneCode) {
    return (
      <PhoneVerification
        onBack={() => {
          setVerifyingMethod(undefined);
        }}
      />
    );
  }

  const hasEmailVerification = Boolean(userInfo?.primaryEmail);
  const hasPhoneVerification = Boolean(userInfo?.primaryPhone);

  return (
    <SecondaryPageLayout
      title="account_center.verification.title"
      description="account_center.verification.description"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {userInfo?.hasPassword && (
          <VerificationMethodButton
            method={VerificationMethod.Password}
            onClick={() => {
              setVerifyingMethod(VerificationMethod.Password);
            }}
          />
        )}
        {hasEmailVerification && (
          <VerificationMethodButton
            method={VerificationMethod.EmailCode}
            onClick={() => {
              setVerifyingMethod(VerificationMethod.EmailCode);
            }}
          />
        )}
        {hasPhoneVerification && (
          <VerificationMethodButton
            method={VerificationMethod.PhoneCode}
            onClick={() => {
              setVerifyingMethod(VerificationMethod.PhoneCode);
            }}
          />
        )}
      </div>
    </SecondaryPageLayout>
  );
};

export default VerificationMethodList;
