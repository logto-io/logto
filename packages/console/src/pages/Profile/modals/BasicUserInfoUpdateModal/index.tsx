import type { AdminConsoleKey } from '@logto/phrases';
import { useEffect, useState } from 'react';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import { adminTenantEndpoint, meApi } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

export type BasicUserField = 'avatar' | 'username' | 'name';

type Props = {
  field?: BasicUserField;
  value: string;
  isOpen?: boolean;
  onClose: () => void;
};

const BasicUserInfoUpdateModal = ({ field, value: defaultValue, isOpen, onClose }: Props) => {
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  if (!field) {
    return null;
  }

  const getModalTitle = (): AdminConsoleKey => {
    if (field === 'avatar') {
      return 'profile.change_avatar';
    }

    if (field === 'username') {
      return 'profile.change_username';
    }

    return defaultValue ? 'profile.change_name' : 'profile.set_name';
  };

  const onSubmit = async () => {
    setLoading(true);

    try {
      await api.patch(`me/user`, { json: { [field]: value } }).json();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={!!isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title={getModalTitle()}
        footer={
          <Button
            type="primary"
            title="general.save"
            isLoading={loading}
            disabled={value === defaultValue || (!value && field === 'username')}
            onClick={onSubmit}
          />
        }
        onClose={() => {
          onClose();
        }}
      >
        <div>
          <TextInput
            name={field}
            value={value}
            onChange={(event) => {
              setValue(event.currentTarget.value);
            }}
          />
        </div>
      </ModalLayout>
    </ReactModal>
  );
};

export default BasicUserInfoUpdateModal;
