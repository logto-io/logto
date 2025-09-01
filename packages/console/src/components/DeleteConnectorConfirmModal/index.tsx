import { useTranslation } from 'react-i18next';

import ConfirmModal from '@/ds-components/ConfirmModal';

type Props = {
  readonly isOpen: boolean;
  readonly isLoading: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};

function DeleteConnectorConfirmModal({ isOpen, isLoading, onCancel, onConfirm }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ConfirmModal
      isOpen={isOpen}
      confirmButtonText="general.delete"
      isLoading={isLoading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {t('connector_details.deletion_description')}
    </ConfirmModal>
  );
}

export default DeleteConnectorConfirmModal;
