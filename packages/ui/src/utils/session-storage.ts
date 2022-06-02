import { signInNotificationStorageKey } from '@logto/schemas';

export const getAppNotificationInfo = () => {
  return sessionStorage.getItem(signInNotificationStorageKey);
};

export const clearAppNotificationInfo = () => {
  sessionStorage.removeItem(signInNotificationStorageKey);
};
