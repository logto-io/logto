import { type Hook } from '@logto/schemas';
import { webhookLimit } from '@logto/shared/universal';
import { Trans, useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import ConfirmModal from '@/components/ConfirmModal';
import TextLink from '@/components/TextLink';
import { contactEmail, contactEmailLink } from '@/consts';
import * as modalStyles from '@/scss/modal.module.scss';

import CreateForm from './CreateForm';

type Props = {
  isOpen: boolean;
  onClose: (createdHook?: Hook) => void;
  existingHooksCount: number;
};

function CreateFormModal({ isOpen, onClose, existingHooksCount }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const shouldBlockCreation = existingHooksCount >= webhookLimit;

  if (shouldBlockCreation) {
    return (
      <ConfirmModal
        isOpen={isOpen}
        cancelButtonText="general.got_it"
        onCancel={() => {
          onClose();
        }}
      >
        <Trans
          components={{
            a: <TextLink to={contactEmailLink} />,
          }}
        >
          {t('webhooks.create_form.block_description', { link: contactEmail })}
        </Trans>
      </ConfirmModal>
    );
  }

  return (
    <Modal
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <CreateForm onClose={onClose} />
    </Modal>
  );
}

export default CreateFormModal;
