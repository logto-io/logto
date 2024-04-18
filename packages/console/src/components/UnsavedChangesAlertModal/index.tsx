import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { unstable_useBlocker as useBlocker, useLocation } from 'react-router-dom';

import ConfirmModal from '@/ds-components/ConfirmModal';

type Props = {
  readonly hasUnsavedChanges: boolean;
  readonly parentPath?: string;
  readonly onConfirm?: () => void;
};

function UnsavedChangesAlertModal({ hasUnsavedChanges, parentPath, onConfirm }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { pathname } = useLocation();
  const blocker = useBlocker(hasUnsavedChanges);

  // Reset the blocker if the conditions are met.
  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return;
    }

    const targetPathname = blocker.location.pathname;
    if (!hasUnsavedChanges || targetPathname === pathname) {
      blocker.reset();
      return;
    }
    if (parentPath && targetPathname.startsWith(parentPath)) {
      blocker.proceed();
    }
  }, [blocker, pathname, hasUnsavedChanges, parentPath]);

  return (
    <ConfirmModal
      isOpen={blocker.state === 'blocked'}
      confirmButtonText="general.leave_page"
      cancelButtonText="general.stay_on_page"
      onCancel={blocker.reset}
      onConfirm={() => {
        onConfirm?.();
        blocker.proceed?.();
      }}
    >
      {t('general.unsaved_changes_warning')}
    </ConfirmModal>
  );
}

export default UnsavedChangesAlertModal;
