import { type SignInExperience } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/ds-components/Button';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DangerousRaw from '@/ds-components/DangerousRaw';
import Tooltip from '@/ds-components/Tip/Tooltip';
import useApi, { type RequestError } from '@/hooks/use-api';

type Props = {
  readonly userId: string;
};

function ExpirePasswordButton({ userId }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.user_details.expire_password',
  });
  const api = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: signInExperience } = useSWR<SignInExperience, RequestError>('api/sign-in-exp');
  const isEnabled = Boolean(
    signInExperience?.passwordExpiration.enabled &&
      signInExperience.passwordExpiration.validPeriodDays
  );

  const onConfirm = async () => {
    setIsLoading(true);
    try {
      await api.patch(`api/users/${userId}/password/expire`);
      toast.success(t('success'));
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Tooltip content={isEnabled ? undefined : t('not_enabled_tooltip')}>
        <Button
          title={<DangerousRaw>{t('button')}</DangerousRaw>}
          type="text"
          size="small"
          disabled={!isEnabled}
          onClick={() => {
            setIsModalOpen(true);
          }}
        />
      </Tooltip>
      <ConfirmModal
        isOpen={isModalOpen}
        isLoading={isLoading}
        title="user_details.expire_password.title"
        onCancel={() => {
          setIsModalOpen(false);
        }}
        onConfirm={onConfirm}
      >
        {t('content')}
      </ConfirmModal>
    </>
  );
}

export default ExpirePasswordButton;
