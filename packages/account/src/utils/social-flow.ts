import type { NavigateFunction } from 'react-router-dom';

import {
  clearRedirectUrl,
  clearShowSuccess,
  getRedirectUrl,
  getShowSuccess,
} from './account-center-route';
import { accountStorage } from './session-storage';

type FinalizeSocialFlowSuccessParameters = {
  connectorId: string;
  successMessage: string;
  refreshUserInfo: () => Promise<void>;
  setToast: (message: string) => void;
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
  navigate('/', { replace: true });
};

const handleSocialFlowRedirect = (navigate: NavigateFunction) => {
  const redirectUrl = getRedirectUrl();
  const showSuccess = getShowSuccess();

  if (redirectUrl && !showSuccess) {
    clearRedirectUrl();
    window.location.assign(redirectUrl);
    return;
  }

  clearRedirectUrl();
  clearShowSuccess();
  navigateToSecurity(navigate);
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
  setToast(successMessage);
  handleSocialFlowRedirect(navigate);
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
