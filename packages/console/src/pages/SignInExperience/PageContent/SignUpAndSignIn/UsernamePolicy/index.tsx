import { type SignInExperience } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';

import UsernamePolicyModal from './UsernamePolicyModal';
import styles from './index.module.scss';

type Props = {
  readonly signInExperience: SignInExperience;
};

function UsernamePolicy({ signInExperience }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.sign_in_exp.sign_up_and_sign_in.username_policy',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <FormField title="sign_in_exp.sign_up_and_sign_in.username_policy.title">
      <div className={styles.entry}>
        <div className={styles.description}>{t('description')}</div>
        <Button
          type="outline"
          title="sign_in_exp.sign_up_and_sign_in.username_policy.manage_button"
          onClick={() => {
            setIsModalOpen(true);
          }}
        />
      </div>
      {isModalOpen && (
        <UsernamePolicyModal
          policy={signInExperience.usernamePolicy}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </FormField>
  );
}

export default UsernamePolicy;
