import { type AdminConsoleKey } from '@logto/phrases';
import { useCallback, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/icons/delete.svg';
import Edit from '@/assets/icons/edit.svg';
import More from '@/assets/icons/more.svg';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import ConfirmModal from '@/ds-components/ConfirmModal';
import useActionTranslation from '@/hooks/use-action-translation';

import * as styles from './index.module.scss';

type Props = {
  /** A function that will be called when the user confirms the deletion. */
  onDelete: () => void | Promise<void>;
  /** A function that will be called when the user clicks the edit button. */
  onEdit: () => void | Promise<void>;
  /** The text or content to display in the confirmation modal. */
  content: ReactNode;
  /** The name of the field that is being operated. */
  fieldName: AdminConsoleKey;
};

/**
 * A button that displays a three-dot icon and opens a menu the following options:
 *
 * - Edit
 * - Delete
 */
function ActionsButton({ onDelete, onEdit, content, fieldName }: Props) {
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
        {content}
      </ConfirmModal>
    </>
  );
}
export default ActionsButton;
