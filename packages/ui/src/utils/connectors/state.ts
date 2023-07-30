import { generateRandomString } from '..';

export type StorageStateKeyPrefix = `${'social' | 'blockchain'}_auth_state`;

export const generateState = () => {
  const uuid = generateRandomString();

  return uuid;
};

export const stateUtils = (storageStateKeyPrefix: string) => {
  const storeState = (connectorId: string, state: string) => {
    sessionStorage.setItem(`${storageStateKeyPrefix}:${connectorId}`, state);
  };

  const getState = (connectorId: string) => {
    return sessionStorage.getItem(`${storageStateKeyPrefix}:${connectorId}`);
  };

  const stateValidation = (connectorId: string, state: string) => {
    const storageKey = `${storageStateKeyPrefix}:${connectorId}`;
    const stateStorage = sessionStorage.getItem(storageKey);
    sessionStorage.removeItem(storageKey);

    return stateStorage === state;
  };

  return {
    generateState,
    storeState,
    getState,
    stateValidation,
  };
};
