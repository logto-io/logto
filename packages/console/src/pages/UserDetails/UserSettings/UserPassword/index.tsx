import { type UserProfileResponse } from '@logto/schemas';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Key from '@/assets/icons/key.svg?react';
import UserAccountInformation from '@/components/UserAccountInformation';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import modalStyles from '@/scss/modal.module.scss';

import ResetPasswordForm from '../../components/ResetPasswordForm';

import styles from './index.module.scss';

type Props = {
  readonly user: UserProfileResponse;
  readonly onResetPassword: () => void;
};

function UserPassword({ user, onResetPassword }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { hasPassword = false } = user;

  const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);
  const [newPassword, setNewPassword] = useState<string>();

  // Use a ref to store the initial state of hasPassword to determine which title to show when the password has been reset
  const initialHasPassword = useRef(hasPassword);

  return (
    <>
      <div className={styles.password}>
        <div className={styles.label}>
          <Key className={styles.icon} />
          <span>
            <DynamicT forKey="user_details.field_password" />
          </span>
        </div>
        <div className={styles.text}>
          <DynamicT
            forKey={`user_details.${hasPassword ? 'password_already_set' : 'no_password_set'}`}
          />
        </div>
        <div className={styles.actionButton}>
          <Button
            title={`general.${hasPassword ? 'reset' : 'generate'}`}
            type="text"
            size="small"
            onClick={() => {
              setIsResetPasswordFormOpen(true);
            }}
          />
        </div>
      </div>
      <ReactModal
        shouldCloseOnEsc
        isOpen={isResetPasswordFormOpen}
        className={modalStyles.content}
        overlayClassName={modalStyles.overlay}
        onRequestClose={() => {
          setIsResetPasswordFormOpen(false);
        }}
      >
        <ResetPasswordForm
          userId={user.id}
          hasPassword={hasPassword}
          onClose={(password) => {
            setIsResetPasswordFormOpen(false);

            if (password) {
              setNewPassword(password);
              onResetPassword();
            }
          }}
        />
      </ReactModal>
      {newPassword && (
        <UserAccountInformation
          title={`user_details.reset_password.${
            initialHasPassword.current ? 'reset_complete' : 'generate_complete'
          }`}
          user={user}
          password={newPassword}
          passwordLabel={t(
            `user_details.reset_password.${
              initialHasPassword.current ? 'new_password' : 'password'
            }`
          )}
          onClose={() => {
            setNewPassword(undefined);
            // Update the initial state to true once the user has acknowledged the new password
            // eslint-disable-next-line @silverhand/fp/no-mutation
            initialHasPassword.current = true;
          }}
        />
      )}
    </>
  );
}

export default UserPassword;
