import { useContext, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';
import { VerificationMethod } from '@ac/types';

import EmailVerification from '../EmailVerification';
import PasswordVerification from '../PasswordVerification';
import VerificationMethodButton from '../VerificationMethodButton';

const VerificationMethodList = () => {
  const { userInfo } = useContext(PageContext);
  const [verifyingMethod, setVerifyingMethod] = useState<'password' | 'email' | undefined>();

  if (verifyingMethod === 'password') {
    return (
      <PasswordVerification
        onBack={() => {
          setVerifyingMethod(undefined);
        }}
      />
    );
  }

  if (verifyingMethod === 'email') {
    return (
      <EmailVerification
        onBack={() => {
          setVerifyingMethod(undefined);
        }}
      />
    );
  }

  const hasEmailVerification = Boolean(userInfo?.primaryEmail);

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
              setVerifyingMethod('password');
            }}
          />
        )}
        {hasEmailVerification && (
          <VerificationMethodButton
            method={VerificationMethod.EmailCode}
            onClick={() => {
              setVerifyingMethod('email');
            }}
          />
        )}
      </div>
    </SecondaryPageLayout>
  );
};

export default VerificationMethodList;
