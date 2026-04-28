import { AccountCenterControlValue } from '@logto/schemas';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { sessionStorage } from '@ac/utils/session-storage';
import type { PendingVerifiedAction } from '@ac/utils/session-storage';

const VerifiedAction = () => {
  const navigate = useNavigate();
  const { accountCenterSettings, verificationId } = useContext(PageContext);
  const action = useMemo<PendingVerifiedAction | undefined>(
    () => sessionStorage.getPendingVerifiedAction(),
    []
  );

  const verificationIdRef = useRef(verificationId);
  // Keep the latest verification result for the unmount cleanup without making
  // the cleanup run on every verificationId change.
  // eslint-disable-next-line @silverhand/fp/no-mutation
  verificationIdRef.current = verificationId;

  useEffect(
    () => () => {
      if (!verificationIdRef.current) {
        sessionStorage.clearPendingVerifiedAction();
      }
    },
    []
  );

  const isActionAllowed = useMemo(() => {
    if (!accountCenterSettings?.enabled) {
      return false;
    }
    switch (action) {
      case 'enable-mfa':
      case 'disable-mfa': {
        return accountCenterSettings.fields.mfa === AccountCenterControlValue.Edit;
      }
      case 'remove-email': {
        return accountCenterSettings.fields.email === AccountCenterControlValue.Edit;
      }
      case 'remove-username': {
        return accountCenterSettings.fields.username === AccountCenterControlValue.Edit;
      }
      case 'remove-phone': {
        return accountCenterSettings.fields.phone === AccountCenterControlValue.Edit;
      }
      default: {
        return false;
      }
    }
  }, [accountCenterSettings, action]);

  useEffect(() => {
    if (verificationId && action && accountCenterSettings && isActionAllowed) {
      navigate(-1);
    }
  }, [accountCenterSettings, action, isActionAllowed, navigate, verificationId]);

  if (!action) {
    return <ErrorPage titleKey="error.something_went_wrong" messageKey="error.invalid_session" />;
  }

  if (!accountCenterSettings) {
    return null;
  }

  if (!isActionAllowed) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  // The verified section handles the pending action after navigation returns.
  return null;
};

export default VerifiedAction;
