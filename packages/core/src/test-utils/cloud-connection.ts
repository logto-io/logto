import { mockGetCloudConnectionData } from '#src/__mocks__/cloud-connection.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';

const { jest } = import.meta;

type PublicPart<T> = { [K in keyof T]: T[K] };

export const createMockCloudConnectionLibrary = (): CloudConnectionLibrary => {
  class MockLibrary implements PublicPart<CloudConnectionLibrary> {
    public getCloudConnectionData = mockGetCloudConnectionData;

    public getAccessToken = jest.fn();

    public getClient = jest.fn();
  }

  const library = new MockLibrary();

  // eslint-disable-next-line no-restricted-syntax
  return library as unknown as CloudConnectionLibrary;
};
