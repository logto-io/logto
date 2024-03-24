import { yes } from '@silverhand/essentials';

export const isIntegrationTest = () => yes(process.env.INTEGRATION_TEST);

export const getPwnPasswordsForTest = () => {
  if (!isIntegrationTest()) {
    throw new Error('This function should only be called in integration tests');
  }
  return Object.freeze(['123456aA', 'test_password']);
};
