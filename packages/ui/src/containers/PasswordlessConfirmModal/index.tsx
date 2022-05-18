import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi, PasscodeChannel } from '@/apis/utils';
import ConfirmModal from '@/components/ConfirmModal';
import useApi from '@/hooks/use-api';
import { UserFlow } from '@/types';

type Props = {
  className?: string;
  isOpen?: boolean;
  type: UserFlow;
  method: PasscodeChannel;
  value: string;
  onClose: () => void;
};

const PasswordlessConfirmModal = ({ className, isOpen, type, method, value, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const sendPasscode = getSendPasscodeApi(type, method);
  const navigate = useNavigate();

  const { result, run: asyncSendPasscode } = useApi(sendPasscode);

  const onConfirmHandler = useCallback(() => {
    onClose();
    void asyncSendPasscode(value);
  }, [asyncSendPasscode, onClose, value]);

  useEffect(() => {
    if (result) {
      navigate(
        {
          pathname: `/${type}/${method}/passcode-validation`,
        },
        { state: { [method]: value } }
      );
    }
  }, [method, result, type, value, navigate, onClose]);

  return (
    <ConfirmModal
      className={className}
      isOpen={isOpen}
      confirmText={type === 'sign-in' ? 'action.sign_in' : 'action.create'}
      onClose={onClose}
      onConfirm={onConfirmHandler}
    >
      {t(
        type === 'sign-in'
          ? 'description.create_account_id_exists'
          : 'description.sign_in_id_does_not_exists',
        {
          type: t(`description.${method === 'email' ? 'email' : 'phone_number'}`),
          value: `${method === 'sms' ? '+' : ''}${value}`,
        }
      )}
    </ConfirmModal>
  );
};

export default PasswordlessConfirmModal;
