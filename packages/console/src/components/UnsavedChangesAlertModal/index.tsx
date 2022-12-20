import type { Blocker, Transition } from 'history';
import { useCallback, useContext, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Navigator } from 'react-router-dom';
import { UNSAFE_NavigationContext } from 'react-router-dom';

import ConfirmModal from '../ConfirmModal';

/**
 * The `usePrompt` and `useBlock` hooks are removed from react-router v6, as the developers think
 * they are not ready to be shipped in v6. Reference: https://github.com/remix-run/react-router/issues/8139
 * Therefore we have to implement our own workaround to provide the same functionality, through `UNSAFE_NavigationContext`.
 */
type BlockFunction = (blocker: Blocker) => () => void;

type BlockerNavigator = Navigator & {
  location: Location;
  block: BlockFunction;
};

type Props = {
  hasUnsavedChanges: boolean;
  parentPath?: string;
};

const UnsavedChangesAlertModal = ({ hasUnsavedChanges, parentPath }: Props) => {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  /**
   * Props `block` and `location` are removed from `Navigator` type in react-router, for the same reason as above.
   * So we have to define our own type `BlockerNavigator` to acquire these props that actually exist in `navigator` object.
   */
  // eslint-disable-next-line no-restricted-syntax
  const { block, location } = navigator as BlockerNavigator;

  const [displayAlert, setDisplayAlert] = useState(false);
  const [transition, setTransition] = useState<Transition>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  useLayoutEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const { pathname } = location;

    const unblock = block((transition) => {
      const {
        location: { pathname: targetPathname },
      } = transition;

      const executeTransition = () => {
        unblock();
        transition.retry();
      };

      // Note: We don't want to show the alert if the user is navigating to the same page.
      if (targetPathname === pathname) {
        executeTransition();

        return;
      }

      if (parentPath && targetPathname.startsWith(parentPath)) {
        executeTransition();

        return;
      }

      setDisplayAlert(true);

      setTransition({
        ...transition,
        retry() {
          executeTransition();
        },
      });
    });

    return unblock;
  }, [navigator, hasUnsavedChanges, location, block, parentPath]);

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
      confirmButtonText="general.leave_page"
      cancelButtonText="general.stay_on_page"
      onCancel={stayOnPage}
      onConfirm={leavePage}
    >
      {t('general.unsaved_changes_warning')}
    </ConfirmModal>
  );
};

export default UnsavedChangesAlertModal;
