import { type ConnectorLibrary } from '#src/libraries/connector.js';

const { jest } = import.meta;

export const createMockConnectorLibrary = (): ConnectorLibrary => {
  return {
    getCloudConnectionData: jest.fn(),
    getConnectorConfig: jest.fn(),
    getLogtoConnectors: jest.fn(),
    getLogtoConnectorsWellKnown: jest.fn(),
    getLogtoConnectorById: jest.fn(),
  };
};
