import { defaultConnectorMethods } from '@logto/cli/lib/connector/index.js';
import { ConnectorType, TemplateType } from '@logto/connector-kit';
import { type Passcode } from '@logto/schemas';
import { any } from 'zod';

import { mockConnector, mockMetadata } from '#src/__mocks__/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createPasscodeLibrary } from './passcode.js';

const { jest } = import.meta;

const getMessageConnector = jest.fn();
const getI18nEmailTemplate = jest.fn();

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
  { getI18nEmailTemplate, getMessageConnector }
);

describe('sendPasscode validateOnly', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate connector/template without sending when validateOnly is true', async () => {
    const sendMessage = jest.fn();
    getMessageConnector.mockResolvedValueOnce({
      ...defaultConnectorMethods,
      configGuard: any(),
      dbEntry: {
        ...mockConnector,
        id: 'id0',
        config: {
          templates: [
            { usageType: TemplateType.ForgotPassword, subject: 'subject', content: 'code' },
          ],
        },
      },
      metadata: {
        ...mockMetadata,
        platform: null,
      },
      type: ConnectorType.Email,
      sendMessage,
    });
    getI18nEmailTemplate.mockResolvedValueOnce(null);
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

    await sendPasscode(passcode, { locale: 'en' }, { validateOnly: true });

    expect(getMessageConnector).toHaveBeenCalledWith(ConnectorType.Email);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('should still fail fast when validateOnly is true but the template is unavailable', async () => {
    const sendMessage = jest.fn();
    getMessageConnector.mockResolvedValueOnce({
      ...defaultConnectorMethods,
      configGuard: any(),
      dbEntry: {
        ...mockConnector,
        id: 'id0',
        config: {
          templates: [],
        },
      },
      metadata: {
        ...mockMetadata,
        platform: null,
      },
      type: ConnectorType.Email,
      sendMessage,
    });
    getI18nEmailTemplate.mockResolvedValueOnce(null);
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

    await expect(sendPasscode(passcode, { locale: 'en' }, { validateOnly: true })).rejects.toThrow(
      'Template not found for type: ForgotPassword'
    );
  });
});
