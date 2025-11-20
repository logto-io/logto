import { useContext, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';

import PasswordVerification from '../PasswordVerification';

const VerificationMethodList = () => {
  const { userInfo } = useContext(PageContext);
  const [verifyingMethod, setVerifyingMethod] = useState<'password' | undefined>();

  if (verifyingMethod === 'password') {
    return <PasswordVerification />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Security Verification</h1>
      <p>Please select a verification method to continue.</p>
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
    </div>
  );
};

export default VerificationMethodList;
