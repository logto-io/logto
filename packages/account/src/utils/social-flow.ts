import type { NavigateFunction } from 'react-router-dom';

import { socialSuccessRoute } from '@ac/constants/routes';

import { accountStorage, sessionStorage } from './session-storage';

type FinalizeSocialFlowSuccessParameters = {
  connectorId: string;
  successMessage?: string;
  refreshUserInfo: () => Promise<void>;
  setToast?: (message: string) => void;
  navigate: NavigateFunction;
};

type FinalizeSocialFlowFailureParameters = {
  connectorId?: string;
  clearFlowRecord?: boolean;
  message: string;
  setToast: (message: string) => void;
  navigate: NavigateFunction;
};

const navigateToSecurity = (navigate: NavigateFunction) => {
  const pendingReturn = sessionStorage.getPendingReturn();

  if (pendingReturn) {
    sessionStorage.clearPendingReturn();
    window.location.assign(pendingReturn);
    return;
  }

  navigate('/', { replace: true });
};

export const finalizeSocialFlowSuccess = async ({
  connectorId,
  successMessage,
  refreshUserInfo,
  setToast,
  navigate,
}: FinalizeSocialFlowSuccessParameters) => {
  accountStorage.socialFlow.clear(connectorId);
  await refreshUserInfo();
  if (successMessage && setToast) {
    setToast(successMessage);
  }
  navigate(socialSuccessRoute, { replace: true });
};

export const finalizeSocialFlowFailure = ({
  connectorId,
  clearFlowRecord = false,
  message,
  setToast,
  navigate,
}: FinalizeSocialFlowFailureParameters) => {
  if (connectorId && clearFlowRecord) {
    accountStorage.socialFlow.clear(connectorId);
  }

  setToast(message);
  navigateToSecurity(navigate);
};
