import { GetConnectorConfig } from '@logto/connector-schemas';

import AzureADConnector from '.';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

describe('Azure AD connector', () => {
  it('init without exploding', () => {
    expect(() => new AzureADConnector(getConnectorConfig)).not.toThrow();
  });
});
