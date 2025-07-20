import { useLogto } from '@logto/react';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { clearEncryptionData } from '../utils/encryption';
import { encryptWithPassword, decryptWithPassword } from '../utils/zero-knowledge-encryption';
import { splitPassword } from '../utils/zero-knowledge-password';

import styles from './ChangePassword.module.scss';

// Type guard utility functions
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasStringProperty = (
  object: Record<string, unknown>,
  key: string
): object is Record<string, unknown> & Record<typeof key, string> =>
  key in object && typeof object[key] === 'string';

const ChangePassword = () => {
  const { getAccessToken } = useLogto();
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | undefined>(
    undefined
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      // Clear previous messages
      setMessage(undefined);

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }

      setLoading(true);

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error('Not authenticated');
        }

        // Split passwords for zero-knowledge encryption
        const { serverPassword: oldServerPassword, clientPassword: oldClientPassword } =
          await splitPassword(oldPassword);

        const { serverPassword: newServerPassword, clientPassword: newClientPassword } =
          await splitPassword(newPassword);

        // Get current encrypted secret
        const profileResponse = await fetch(
          'http://localhost:3001/api/my-account/password/profile',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData: unknown = await profileResponse.json();
        const encryptedSecret =
          isObject(profileData) && hasStringProperty(profileData, 'encryptedSecret')
            ? profileData.encryptedSecret
            : undefined;

        const getNewEncryptedSecret = async (): Promise<string | undefined> => {
          if (encryptedSecret) {
            // Decrypt and re-encrypt the secret
            try {
              const decryptedSecret = await decryptWithPassword(encryptedSecret, oldClientPassword);
              return await encryptWithPassword(decryptedSecret, newClientPassword);
            } catch {
              throw new Error('Incorrect current password');
            }
          }
          return undefined;
        };

        const newEncryptedSecret = await getNewEncryptedSecret();

        // Change password

        const changeResponse = await fetch('http://localhost:3001/api/my-account/password', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldPassword: oldServerPassword,
            newPassword: newServerPassword,
            ...(newEncryptedSecret && { encryptedSecret: newEncryptedSecret }),
          }),
        });

        if (!changeResponse.ok) {
          const errorData: unknown = await changeResponse.json();
          const errorMessage =
            isObject(errorData) && hasStringProperty(errorData, 'message')
              ? errorData.message
              : undefined;
          throw new Error(errorMessage ?? 'Failed to change password');
        }

        setMessage({ type: 'success', text: 'Password changed successfully!' });

        // Clear encryption data since keys are now invalid
        clearEncryptionData();

        // Clear form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Failed to change password',
        });
      } finally {
        setLoading(false);
      }
    },
    [oldPassword, newPassword, confirmPassword, getAccessToken]
  );

  return (
    <div className={styles.container}>
      <h1>Change Password</h1>
      <p className={styles.description}>
        Enter your current password and choose a new password for your account.
      </p>

      <div className={styles.notification}>
        Your password change will automatically re-encrypt your zero-knowledge secret with the new
        password.
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="oldPassword">Current Password</label>
          <input
            required
            type="password"
            id="oldPassword"
            value={oldPassword}
            disabled={loading}
            onChange={(event) => {
              setOldPassword(event.target.value);
            }}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="newPassword">New Password</label>
          <input
            required
            type="password"
            id="newPassword"
            value={newPassword}
            disabled={loading}
            onChange={(event) => {
              setNewPassword(event.target.value);
            }}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            required
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            disabled={loading}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
        )}
      </form>
    </div>
  );
};

export default ChangePassword;
