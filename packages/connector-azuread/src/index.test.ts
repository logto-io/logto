import { GetConnectorConfig } from '@logto/connector-core';

import createConnector from '.';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

describe('Azure AD connector', () => {
  it('init without exploding', () => {
    expect(async () => createConnector({ getConfig: getConnectorConfig })).not.toThrow();
  });
});
