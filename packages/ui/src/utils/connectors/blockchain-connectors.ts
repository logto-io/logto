import { stateUtils } from './state';

/**
 * Blockchain Connector State Utility Methods
 */
const storageStateKeyPrefix = 'blockchain_auth_state';

export const { generateState, storeState, stateValidation } = stateUtils(storageStateKeyPrefix);
