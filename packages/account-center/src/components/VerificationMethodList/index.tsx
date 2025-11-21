import { useContext, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import PasswordVerification from '../PasswordVerification';

const VerificationMethodList = () => {
  const { userInfo } = useContext(PageContext);
  const [verifyingMethod, setVerifyingMethod] = useState<'password' | undefined>();

  if (verifyingMethod === 'password') {
    return <PasswordVerification />;
  }

  return (
    <SecondaryPageLayout
      title="account_center.verification.title"
      description="account_center.verification.description"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {userInfo?.hasPassword && (
          <button
            style={{ padding: '10px', textAlign: 'left' }}
            onClick={() => {
              setVerifyingMethod('password');
            }}
          >
            Password
          </button>
        )}
      </div>
    </SecondaryPageLayout>
  );
};

export default VerificationMethodList;
