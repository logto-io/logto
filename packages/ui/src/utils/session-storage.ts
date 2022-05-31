export const appNotificationStorageKey = 'logto:client:notification';

export const getAppNotificationInfo = () => {
  return sessionStorage.getItem(appNotificationStorageKey);
};

export const clearAppNotificationInfo = () => {
  sessionStorage.removeItem(appNotificationStorageKey);
};
