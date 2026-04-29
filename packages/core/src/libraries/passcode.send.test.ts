import { defaultConnectorMethods } from '@logto/cli/lib/connector/index.js';
import { ConnectorType, TemplateType } from '@logto/connector-kit';
import { type Passcode } from '@logto/schemas';
import { any } from 'zod';

import { mockConnector, mockMetadata } from '#src/__mocks__/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createPasscodeLibrary } from './passcode.js';

const { jest } = import.meta;

const getMessageConnector = jest.fn();

const unusedPasscodeQueries = {
  consumePasscode: jest.fn(),
  deletePasscodesByIds: jest.fn(),
  findUnconsumedPasscodeByIdentifierAndType: jest.fn(),
  findUnconsumedPasscodeByJtiAndType: jest.fn(),
  findUnconsumedPasscodesByIdentifierAndType: jest.fn(),
  findUnconsumedPasscodesByJtiAndType: jest.fn(),
  increasePasscodeTryCount: jest.fn(),
  insertPasscode: jest.fn(),
};

const { sendPasscode } = createPasscodeLibrary(
  new MockQueries({ passcodes: unusedPasscodeQueries }),
  // @ts-expect-error Only connector lookups are required in these tests.
  { getMessageConnector }
);

describe('sendPasscode', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should let the connector handle template selection on the send path', async () => {
    const sendMessage = jest.fn();
    getMessageConnector.mockResolvedValueOnce({
      ...defaultConnectorMethods,
      configGuard: any(),
      dbEntry: {
        ...mockConnector,
        id: 'id0',
        config: {},
      },
      metadata: {
        ...mockMetadata,
        platform: null,
      },
      type: ConnectorType.Email,
      sendMessage,
    });
    const passcode: Passcode = {
      tenantId: 'fake_tenant',
      id: 'passcode_id',
      interactionJti: 'jti',
      phone: null,
      email: 'foo@example.com',
      type: TemplateType.ForgotPassword,
      code: '1234',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    };

    await sendPasscode(passcode, { locale: 'en' });

    expect(sendMessage).toHaveBeenCalledWith({
      to: 'foo@example.com',
      type: TemplateType.ForgotPassword,
      payload: {
        code: '1234',
        locale: 'en',
      },
    });
  });
});
