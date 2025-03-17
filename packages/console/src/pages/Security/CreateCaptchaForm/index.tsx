import { type CaptchaType } from '@logto/schemas';
import { useState } from 'react';
import Modal from 'react-modal';

import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import modalStyles from '@/scss/modal.module.scss';

import ProviderRadioGroup from './ProviderRadioGroup';

type Props = {
  readonly isOpen: boolean;
  readonly onClose?: (type?: CaptchaType) => void;
};

function CreateCaptchaForm({ onClose, isOpen: isFormOpen }: Props) {
  const [provider, setProvider] = useState<CaptchaType>();
  const { navigate } = useTenantPathname();

  const handleClose = () => {
    onClose?.();
    setProvider(undefined);
  };

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isFormOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={handleClose}
    >
      <ModalLayout
        title="security.create_captcha.setup_captcha"
        footer={
          <Button
            title="general.next"
            type="primary"
            disabled={!provider}
            onClick={() => {
              navigate(`/security/guide/${provider}`);
            }}
          />
        }
        onClose={handleClose}
      >
        <ProviderRadioGroup value={provider} onChange={setProvider} />
      </ModalLayout>
    </Modal>
  );
}

export default CreateCaptchaForm;
