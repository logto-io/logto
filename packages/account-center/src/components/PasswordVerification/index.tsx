import { useState, useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { verifyPassword } from '@ac/apis/verification';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

const PasswordVerification = () => {
  const { setVerificationId } = useContext(PageContext);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleVerify = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await verifyPassword(password);
      setVerificationId(result.verificationRecordId);
    } catch {
      setError('Verification failed. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SecondaryPageLayout
      title="account_center.password_verification.title"
      description="account_center.password_verification.description"
    >
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            value={password}
            placeholder="Enter password"
            style={{ padding: '8px', marginRight: '10px' }}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <button disabled={loading} style={{ padding: '8px 16px' }} onClick={handleVerify}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </SecondaryPageLayout>
  );
};

export default PasswordVerification;
