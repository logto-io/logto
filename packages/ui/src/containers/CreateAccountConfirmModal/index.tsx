import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi, PasscodeChannel } from '@/apis/utils';
import ConfirmModal from '@/components/ConfirmModal';
import useApi from '@/hooks/use-api';

type Props = {
  className?: string;
  isOpen?: boolean;
  onClose: () => void;
  type: PasscodeChannel;
  value: string;
};

const CreateAccountConfirmModal = ({ className, isOpen = false, type, value, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const sendRegisterPasscode = getSendPasscodeApi('register', type);
  const navigate = useNavigate();

  const { result, run: asyncSendRegisterPasscode } = useApi(sendRegisterPasscode);

  const onConfirmHandler = useCallback(() => {
    onClose();
    void asyncSendRegisterPasscode(value);
  }, [asyncSendRegisterPasscode, onClose, value]);

  useEffect(() => {
    if (result) {
      navigate(
        {
          pathname: `/register/${type}/passcode-validation`,
        },
        { state: { [type]: value } }
      );
    }
  }, [navigate, onClose, result, type, value]);

  return (
    <ConfirmModal
      className={className}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirmHandler}
    >
      {t('description.sign_in_id_does_not_exists', { type, value })}
    </ConfirmModal>
  );
};

export default CreateAccountConfirmModal;
