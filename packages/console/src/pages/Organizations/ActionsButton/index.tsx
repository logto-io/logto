import { type AdminConsoleKey } from '@logto/phrases';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/icons/delete.svg';
import Edit from '@/assets/icons/edit.svg';
import More from '@/assets/icons/more.svg';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DynamicT from '@/ds-components/DynamicT';
import useActionTranslation from '@/hooks/use-action-translation';

import * as styles from './index.module.scss';

type Props = {
  /** A function that will be called when the user confirms the deletion. */
  onDelete: () => void | Promise<void>;
  /** A function that will be called when the user clicks the edit button. */
  onEdit: () => void | Promise<void>;
  /** The translation key of the content that will be displayed in the confirmation modal. */
  deleteConfirmation: AdminConsoleKey;
  /** The name of the field that is being operated. */
  fieldName: AdminConsoleKey;
};

/**
 * A button that displays a three-dot icon and opens a menu the following options:
 *
 * - Edit
 * - Delete
 */
function ActionsButton({ onDelete, onEdit, deleteConfirmation, fieldName }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();
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
      <ActionMenu
        buttonProps={{ icon: <More className={styles.moreIcon} />, size: 'small', type: 'text' }}
        title={t('general.more_options')}
      >
        <ActionMenuItem iconClassName={styles.moreIcon} icon={<Edit />} onClick={onEdit}>
          {tAction('edit', fieldName)}
        </ActionMenuItem>
        <ActionMenuItem
          icon={<Delete />}
          type="danger"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          {tAction('delete', fieldName)}
        </ActionMenuItem>
      </ActionMenu>
      <ConfirmModal
        isOpen={isModalOpen}
        confirmButtonText="general.delete"
        isLoading={isDeleting}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        onConfirm={handleDelete}
      >
        <DynamicT forKey={deleteConfirmation} />
      </ConfirmModal>
    </>
  );
}
export default ActionsButton;
