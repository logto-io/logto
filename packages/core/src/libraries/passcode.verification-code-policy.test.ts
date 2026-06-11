import { TemplateType } from '@logto/connector-kit';
import { type Passcode } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createPasscodeLibrary } from './passcode.js';

const { jest } = import.meta;

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

const findUnconsumedPasscodeByJtiAndType = jest.fn();
const findDefaultSignInExperience = jest.fn();
const { verifyPasscode } = createPasscodeLibrary(
  new MockQueries({
    passcodes: {
      findUnconsumedPasscodesByJtiAndType: jest.fn(),
      findUnconsumedPasscodeByJtiAndType,
      findUnconsumedPasscodeByIdentifierAndType: jest.fn(),
      findUnconsumedPasscodesByIdentifierAndType: jest.fn(),
      deletePasscodesByIds: jest.fn(),
      insertPasscode: jest.fn(),
      consumePasscode: jest.fn(),
      increasePasscodeTryCount: jest.fn(),
    },
    signInExperiences: {
      findDefaultSignInExperience,
    },
  }),
  // @ts-expect-error
  { getMessageConnector: jest.fn() }
);

afterEach(() => {
  jest.clearAllMocks();
});

describe('verifyPasscode verification code policy', () => {
  it.each([
    {
      name: 'custom expiration duration',
      verificationCodePolicy: { expirationDuration: 60 },
      passcodeOverrides: { createdAt: Date.now() - 60 * 1000 - 100 },
      error: new RequestError('verification_code.expired'),
    },
    {
      name: 'custom max retry attempts',
      verificationCodePolicy: { maxRetryAttempts: 1 },
      passcodeOverrides: { tryCount: 1 },
      error: new RequestError('verification_code.exceed_max_try'),
    },
  ])('should respect $name', async ({ verificationCodePolicy, passcodeOverrides, error }) => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      verificationCodePolicy,
    });
    findUnconsumedPasscodeByJtiAndType.mockResolvedValueOnce({
      ...passcode,
      ...passcodeOverrides,
    });

    await expect(
      verifyPasscode(passcode.interactionJti, passcode.type, passcode.code, { phone: 'phone' })
    ).rejects.toThrow(error);
  });
});
