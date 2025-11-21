import { useContext, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';
import { VerificationMethod } from '@ac/types';

import PasswordVerification from '../PasswordVerification';
import VerificationMethodButton from '../VerificationMethodButton';

const VerificationMethodList = () => {
  const { userInfo } = useContext(PageContext);
  const [verifyingMethod, setVerifyingMethod] = useState<'password' | undefined>();

  if (verifyingMethod === 'password') {
    return (
      <PasswordVerification
        onBack={() => {
          setVerifyingMethod(undefined);
        }}
      />
    );
  }

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
      </div>
    </SecondaryPageLayout>
  );
};

export default VerificationMethodList;
