import type { Blocker, Transition } from 'history';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UNSAFE_NavigationContext, Navigator } from 'react-router-dom';

import ConfirmModal from '../ConfirmModal';

type BlockerNavigator = Navigator & {
  location: Location;
  block(blocker: Blocker): () => void;
};

type Props = {
  hasUnsavedChanges: boolean;
};

const UnsavedChangesAlertModal = ({ hasUnsavedChanges }: Props) => {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  const [displayAlert, setDisplayAlert] = useState(false);
  const [transition, setTransition] = useState<Transition>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const {
      block,
      location: { pathname },
    } = navigator as BlockerNavigator;

    const unblock = block((transition) => {
      const {
        location: { pathname: targetPathname },
      } = transition;

      // Note: We don't want to show the alert if the user is navigating to the same page.
      if (targetPathname === pathname) {
        return;
      }

      setDisplayAlert(true);

      setTransition({
        ...transition,
        retry() {
          unblock();
          transition.retry();
        },
      });
    });

    return unblock;
  }, [navigator, hasUnsavedChanges]);

  const leavePage = useCallback(() => {
    transition?.retry();
    setDisplayAlert(false);
  }, [transition]);

  const stayOnPage = useCallback(() => {
    setDisplayAlert(false);
  }, [setDisplayAlert]);

  return (
    <ConfirmModal
      isOpen={displayAlert}
      confirmButtonText="admin_console.general.leave_page"
      cancelButtonText="admin_console.general.stay_on_page"
      onCancel={stayOnPage}
      onConfirm={leavePage}
    >
      {t('general.unsaved_changes_warning')}
    </ConfirmModal>
  );
};

export default UnsavedChangesAlertModal;
