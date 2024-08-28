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
  /** A function that will be called when the user confirms the deletion. If not provided,
   * the delete button will not be displayed.
   */
  readonly onDelete?: () => void | Promise<void>;
  /**
   * A function that will be called when the user clicks the edit button. If not provided,
   * the edit button will not be displayed.
   */
  readonly onEdit?: () => void | Promise<void>;
  /** The translation key of the content that will be displayed in the confirmation modal. */
  readonly deleteConfirmation: AdminConsoleKey;
  /** The name of the field that is being operated. */
  readonly fieldName: AdminConsoleKey;
  /** Overrides the default translations of the edit and delete buttons. */
  readonly textOverrides?: {
    /** The translation key of the edit button. */
    edit?: AdminConsoleKey;
    /** The translation key of the delete button. */
    delete?: AdminConsoleKey;
    /** The translation key of the confirmation modal primary button. */
    deleteConfirmation?: AdminConsoleKey;
  };
};

/**
 * A button that displays a three-dot icon and opens a menu the following options:
 *
 * - Edit (optional)
 * - Delete
 */
function ActionsButton({ onDelete, onEdit, deleteConfirmation, fieldName, textOverrides }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!onDelete) {
      return;
    }

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
      <ActionMenu icon={<More className={styles.icon} />} title={t('general.more_options')}>
        {onEdit && (
          <ActionMenuItem iconClassName={styles.icon} icon={<Edit />} onClick={onEdit}>
            {textOverrides?.edit ? (
              <DynamicT forKey={textOverrides.edit} />
            ) : (
              tAction('edit', fieldName)
            )}
          </ActionMenuItem>
        )}
        {onDelete && (
          <ActionMenuItem
            icon={<Delete />}
            type="danger"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            {textOverrides?.delete ? (
              <DynamicT forKey={textOverrides.delete} />
            ) : (
              tAction('delete', fieldName)
            )}
          </ActionMenuItem>
        )}
      </ActionMenu>
      {onDelete && (
        <ConfirmModal
          isOpen={isModalOpen}
          confirmButtonText={textOverrides?.deleteConfirmation ?? 'general.delete'}
          isLoading={isDeleting}
          onCancel={() => {
            setIsModalOpen(false);
          }}
          onConfirm={handleDelete}
        >
          <DynamicT forKey={deleteConfirmation} />
        </ConfirmModal>
      )}
    </>
  );
}
export default ActionsButton;
