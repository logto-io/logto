import { useCallback, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/icons/delete.svg';
import ConfirmModal from '@/ds-components/ConfirmModal';
import IconButton from '@/ds-components/IconButton';
import { Tooltip } from '@/ds-components/Tip';

type Props = {
  /** A function that will be called when the user confirms the deletion. */
  onDelete: () => void | Promise<void>;
  /** The text or content to display in the confirmation modal. */
  content: ReactNode;
};

/**
 * A button that displays a trash can icon, with a tooltip that says localized
 * "Delete". Clicking the button will pop up a confirmation modal.
 */
function DeleteButton({ onDelete, content }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  }, [onDelete]);

  return (
    <>
      <Tooltip content={<div>{t('general.delete')}</div>}>
        <IconButton
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <Delete />
        </IconButton>
      </Tooltip>
      <ConfirmModal
        isOpen={isModalOpen}
        confirmButtonText="general.delete"
        isLoading={isDeleting}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        onConfirm={handleDelete}
      >
        {content}
      </ConfirmModal>
    </>
  );
}
export default DeleteButton;
