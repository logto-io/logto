import { defaultConnectorMethods } from '@logto/cli/lib/connector/index.js';
import { ConnectorType, TemplateType } from '@logto/connector-kit';
import { type Passcode } from '@logto/schemas';
import { any } from 'zod';

import { mockConnector, mockMetadata, mockUser } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { buildUserContextInfo } from '../utils/connectors/extra-information.js';

import {
  createPasscodeLibrary,
  passcodeExpiration,
  passcodeMaxTryCount,
  passcodeLength,
} from './passcode.js';

const { jest } = import.meta;

const passcodeQueries = {
  findUnconsumedPasscodesByJtiAndType: jest.fn(),
  findUnconsumedPasscodeByJtiAndType: jest.fn(),
  findUnconsumedPasscodeByIdentifierAndType: jest.fn(),
  findUnconsumedPasscodesByIdentifierAndType: jest.fn(),
  deletePasscodesByIds: jest.fn(),
  insertPasscode: jest.fn(),
  consumePasscode: jest.fn(),
  increasePasscodeTryCount: jest.fn(),
};
const {
  findUnconsumedPasscodeByJtiAndType,
  findUnconsumedPasscodesByJtiAndType,
  findUnconsumedPasscodeByIdentifierAndType,
  findUnconsumedPasscodesByIdentifierAndType,
  deletePasscodesByIds,
  increasePasscodeTryCount,
  insertPasscode,
  consumePasscode,
} = passcodeQueries;

const getMessageConnector = jest.fn();

const { createPasscode, sendPasscode, verifyPasscode } = createPasscodeLibrary(
  new MockQueries({ passcodes: passcodeQueries }),
  // @ts-expect-error
  { getMessageConnector }
);

beforeAll(() => {
  findUnconsumedPasscodesByJtiAndType.mockResolvedValue([]);
  findUnconsumedPasscodesByIdentifierAndType.mockResolvedValue([]);
  insertPasscode.mockImplementation(async (data): Promise<Passcode> => {
    return {
      phone: null,
      email: null,
      consumed: false,
      tryCount: 0,
      ...data,
      createdAt: Date.now(),
    };
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('createPasscode', () => {
  it('should generate `passcodeLength` digits code for phone with valid session and insert to database', async () => {
    const phone = '13000000000';
    const passcode = await createPasscode('jti', TemplateType.SignIn, {
      phone,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.phone).toEqual(phone);
  });

  it('should generate `passcodeLength` digits code for email with valid session and insert to database', async () => {
    const email = 'jony@example.com';
    const passcode = await createPasscode('jti', TemplateType.SignIn, {
      email,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.email).toEqual(email);
  });

  it('should generate `passcodeLength` digits code for phone and insert to database, without session', async () => {
    const phone = '13000000000';
    const passcode = await createPasscode(undefined, TemplateType.Generic, {
      phone,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.phone).toEqual(phone);
  });

  it('should generate `passcodeLength` digits code for email and insert to database, without session', async () => {
    const email = 'jony@example.com';
    const passcode = await createPasscode(undefined, TemplateType.Generic, {
      email,
    });
    expect(new RegExp(`^\\d{${passcodeLength}}$`).test(passcode.code)).toBeTruthy();
    expect(passcode.email).toEqual(email);
  });

  it('should remove unconsumed passcode from the same device before sending a new one', async () => {
    const email = 'jony@example.com';
    const jti = 'jti';
    findUnconsumedPasscodesByJtiAndType.mockResolvedValue([
      {
        id: 'id',
        interactionJti: jti,
        code: '1234',
        type: TemplateType.SignIn,
        createdAt: Date.now(),
        phone: '',
        email,
        consumed: false,
        tryCount: 0,
      },
    ]);
    await createPasscode(jti, TemplateType.SignIn, {
      email,
    });
    expect(deletePasscodesByIds).toHaveBeenCalledWith(['id']);
  });

  it('should remove unconsumed passcode from the same device before sending a new one, without session', async () => {
    const phone = '1234567890';
    findUnconsumedPasscodesByIdentifierAndType.mockResolvedValue([
      {
        id: 'id',
        interactionJti: null,
        code: '123456',
        type: TemplateType.Generic,
        createdAt: Date.now(),
        phone,
        email: null,
        consumed: false,
        tryCount: 0,
      },
    ]);
    await createPasscode(undefined, TemplateType.Generic, {
      phone,
    });
    expect(deletePasscodesByIds).toHaveBeenCalledWith(['id']);
  });
});

describe('sendPasscode', () => {
  it('should throw error when email and phone are both empty', async () => {
    const passcode: Passcode = {
      tenantId: 'fake_tenant',
      id: 'id',
      interactionJti: 'jti',
      phone: null,
      email: null,
      type: TemplateType.SignIn,
      code: '1234',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    };
    await expect(sendPasscode(passcode)).rejects.toThrowError(
      new RequestError('verification_code.phone_email_empty')
    );
  });

  it('should call sendPasscode with params matching', async () => {
    const sendMessage = jest.fn();
    getMessageConnector.mockResolvedValueOnce({
      ...defaultConnectorMethods,
      configGuard: any(),
      dbEntry: {
        ...mockConnector,
        id: 'id0',
      },
      metadata: {
        ...mockMetadata,
        platform: null,
      },
      type: ConnectorType.Sms,
      sendMessage,
    });
    const passcode: Passcode = {
      tenantId: 'fake_tenant',
      id: 'passcode_id',
      interactionJti: 'jti',
      phone: 'phone',
      email: null,
      type: TemplateType.SignIn,
      code: '1234',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    };
    await sendPasscode(passcode, { locale: 'en' });
    expect(sendMessage).toHaveBeenCalledWith({
      to: passcode.phone,
      type: passcode.type,
      payload: {
        code: passcode.code,
        locale: 'en',
      },
    });
  });

  it('should include IP address when provided in context payload', async () => {
    const sendMessage = jest.fn();
    getMessageConnector.mockResolvedValueOnce({
      ...defaultConnectorMethods,
      configGuard: any(),
      dbEntry: {
        ...mockConnector,
        id: 'id0',
      },
      metadata: {
        ...mockMetadata,
        platform: null,
      },
      type: ConnectorType.Sms,
      sendMessage,
    });
    const passcode: Passcode = {
      tenantId: 'fake_tenant',
      id: 'passcode_id',
      interactionJti: 'jti',
      phone: 'phone',
      email: null,
      type: TemplateType.SignIn,
      code: '1234',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    };
    await sendPasscode(passcode, { locale: 'en', ip: '192.168.1.100' });
    expect(sendMessage).toHaveBeenCalledWith({
      to: passcode.phone,
      type: passcode.type,
      payload: {
        code: passcode.code,
        locale: 'en',
      },
      ip: '192.168.1.100',
    });
  });
});

describe('verifyPasscode', () => {
  const passcode = {
    tenantId: 'fake_tenant',
    id: 'id',
    interactionJti: 'jti',
    phone: 'phone',
    email: null,
    type: TemplateType.SignIn,
    code: '1234',
    consumed: false,
    tryCount: 0,
    createdAt: Date.now(),
  } satisfies Passcode;

  it('should mark as consumed on successful verification', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' });
    expect(consumePasscode).toHaveBeenCalledWith(passcode.id);
  });

  it('should fail when passcode not found', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(null);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.not_found'));
  });

  it('should mark as consumed on successful verification without jti', async () => {
    const passcodeWithoutJti = {
      ...passcode,
      type: TemplateType.Generic,
      interactionJti: null,
    };
    findUnconsumedPasscodeByIdentifierAndType.mockResolvedValue(passcodeWithoutJti);
    await verifyPasscode(undefined, passcodeWithoutJti.type, passcodeWithoutJti.code, {
      phone: 'phone',
    });
    expect(consumePasscode).toHaveBeenCalledWith(passcodeWithoutJti.id);
  });

  it('should fail when phone mismatch', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, {
        phone: 'invalid_phone',
      })
    ).rejects.toThrow(new RequestError('verification_code.phone_mismatch'));
  });

  it('should fail when email mismatch', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue({
      ...passcode,
      phone: null,
      email: 'email',
    });
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, {
        email: 'invalid_email',
      })
    ).rejects.toThrow(new RequestError('verification_code.email_mismatch'));
  });

  it('should fail when expired', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue({
      ...passcode,
      createdAt: Date.now() - passcodeExpiration - 100,
    });
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.expired'));
  });

  it('should fail when exceed max count', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue({
      ...passcode,
      tryCount: passcodeMaxTryCount,
    });
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.exceed_max_try'));
  });

  it('should fail when invalid code, and should increase try_count', async () => {
    findUnconsumedPasscodeByJtiAndType.mockResolvedValue(passcode);
    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, 'invalid', { phone: 'phone' })
    ).rejects.toThrow(new RequestError('verification_code.code_mismatch'));
    expect(increasePasscodeTryCount).toHaveBeenCalledWith(passcode.id);
  });
});

describe('buildVerificationCodeContext', () => {
  const mockFindUserById = jest.fn().mockResolvedValue(mockUser);
  const mockFindApplicationById = jest.fn().mockResolvedValue({ id: 'app_id', name: 'mock app' });
  const mockFindOrganizationById = jest.fn().mockResolvedValue({ id: 'org_id', name: 'mock org' });
  const mockFindApplicationSignInExperienceById = jest
    .fn()
    .mockResolvedValue({ displayName: 'mock app', branding: {} });

  const { buildVerificationCodeContext } = createPasscodeLibrary(
    new MockQueries({
      passcodes: passcodeQueries,
      users: {
        findUserById: mockFindUserById,
      },
      applications: {
        findApplicationById: mockFindApplicationById,
      },
      organizations: {
        findById: mockFindOrganizationById,
      },
      applicationSignInExperiences: {
        safeFindSignInExperienceByApplicationId: mockFindApplicationSignInExperienceById,
      },
    }),
    // @ts-expect-error
    { getMessageConnector }
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty object when no context info is provided', async () => {
    const context = await buildVerificationCodeContext({});
    expect(context).toEqual({});
  });

  it('should return proper context info when context is provided', async () => {
    const context = await buildVerificationCodeContext({
      applicationId: 'app_id',
      organizationId: 'org_id',
      userId: 'user_id',
    });

    expect(mockFindUserById).toHaveBeenCalledWith('user_id');
    expect(mockFindApplicationById).toHaveBeenCalledWith('app_id');
    expect(mockFindOrganizationById).toHaveBeenCalledWith('org_id');
    expect(mockFindApplicationSignInExperienceById).toHaveBeenCalledWith('app_id');

    expect(context).toEqual({
      application: {
        id: 'app_id',
        name: 'mock app',
        branding: {},
        displayName: 'mock app',
      },
      organization: {
        id: 'org_id',
        name: 'mock org',
      },
      user: buildUserContextInfo(mockUser),
    });
  });

  it('should not call getUserById when user is provided', async () => {
    const context = await buildVerificationCodeContext({
      userId: 'user_id',
      user: mockUser,
    });

    expect(mockFindUserById).not.toHaveBeenCalled();
    expect(mockFindApplicationById).not.toHaveBeenCalled();
    expect(mockFindOrganizationById).not.toHaveBeenCalled();
    expect(context).toEqual({
      user: buildUserContextInfo(mockUser),
    });
  });
});
