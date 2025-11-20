import { AccountCenterControlValue } from '@logto/schemas';
import { useContext, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { verifyPassword } from '@ac/apis/verification';
import ErrorPage from '@ac/components/ErrorPage';

const Email = () => {
  const { accountCenterSettings } = useContext(PageContext);
  const [verificationId, setVerificationId] = useState<string>();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.email !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

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

  if (!verificationId) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Verify Password</h1>
        <p>Please verify your password before changing email.</p>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            value={password}
            placeholder="Enter password"
            style={{ padding: '8px', marginRight: '10px' }}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <button disabled={loading} style={{ padding: '8px 16px' }} onClick={handleVerify}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Email Settings</h1>
      <p>Verification ID: {verificationId}</p>
      <p>Email linking function is currently blank.</p>
    </div>
  );
};

export default Email;
