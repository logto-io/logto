import { Blocker, Transition } from 'history';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UNSAFE_NavigationContext, Navigator } from 'react-router-dom';

import ConfirmModal from '@/components/ConfirmModal';

type BlockerNavigator = Navigator & {
  location: Location;
  block(blocker: Blocker): () => void;
};

export const useUnsavedChangesAlertModal = (when: boolean) => {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  const [displayAlert, setDisplayAlert] = useState(false);
  const [transition, setTransition] = useState<Transition>();

  useEffect(() => {
    if (!when) {
      return;
    }

    const {
      block,
      location: { pathname },
    } = navigator as BlockerNavigator;

    const unblock = block((tx) => {
      const {
        location: { pathname: targetPathname },
      } = tx;

      // Note: We don't want to show the alert if the user is navigating to the same page.
      if (targetPathname === pathname) {
        return;
      }

      setDisplayAlert(true);

      setTransition({
        ...tx,
        retry() {
          unblock();
          tx.retry();
        },
      });
    });

    return unblock;
  }, [navigator, when]);

  const leavePage = useCallback(() => {
    transition?.retry();
    setDisplayAlert(false);
  }, [transition]);

  const stayOnPage = useCallback(() => {
    setDisplayAlert(false);
  }, [setDisplayAlert]);

  const UnsavedChangesAlertModal = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

    return (
      <ConfirmModal
        isOpen={displayAlert}
        confirmButtonType="primary"
        confirmButtonText="admin_console.general.stay_on_page"
        cancelButtonText="admin_console.general.leave_page"
        onCancel={leavePage}
        onConfirm={stayOnPage}
        onClose={stayOnPage}
      >
        {t('general.unsaved_changes_warning')}
      </ConfirmModal>
    );
  };

  return UnsavedChangesAlertModal;
};
