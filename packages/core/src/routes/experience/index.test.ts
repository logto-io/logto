/* eslint-disable max-lines */
import { TemplateType } from '@logto/connector-kit';
import {
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  SignInIdentifier,
  VerificationType,
  type Mfa,
  type User,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import type { Middleware } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import {
  mockUser,
  mockUserBackupCodeMfaVerification,
  mockUserTotpMfaVerification,
  mockUserWebAuthnMfaVerification,
} from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const experienceRoutes = await pickDefault(import('./index.js'));

const eligibleTrustedDeviceVerificationCases: Array<{
  name: string;
  factor: MfaFactor;
  mfaVerification?: User['mfaVerifications'][number];
  verificationRecord: Record<string, unknown>;
}> = [
  {
    name: 'TOTP',
    factor: MfaFactor.TOTP,
    mfaVerification: mockUserTotpMfaVerification,
    verificationRecord: {
      id: 'totp-verification-id',
      type: VerificationType.TOTP,
      userId: mockUser.id,
      verified: true,
    },
  },
  {
    name: 'WebAuthn',
    factor: MfaFactor.WebAuthn,
    mfaVerification: mockUserWebAuthnMfaVerification,
    verificationRecord: {
      id: 'webauthn-verification-id',
      type: VerificationType.WebAuthn,
      userId: mockUser.id,
      verified: true,
    },
  },
  {
    name: 'email OTP',
    factor: MfaFactor.EmailVerificationCode,
    verificationRecord: {
      id: 'email-mfa-verification-id',
      type: VerificationType.MfaEmailVerificationCode,
      identifier: { type: SignInIdentifier.Email, value: mockUser.primaryEmail },
      templateType: TemplateType.MfaVerification,
      verified: true,
    },
  },
  {
    name: 'SMS OTP',
    factor: MfaFactor.PhoneVerificationCode,
    verificationRecord: {
      id: 'phone-mfa-verification-id',
      type: VerificationType.MfaPhoneVerificationCode,
      identifier: { type: SignInIdentifier.Phone, value: mockUser.primaryPhone },
      templateType: TemplateType.MfaVerification,
      verified: true,
    },
  },
];

const createLogMiddleware = (): {
  middleware: Middleware<unknown, IRouterParamContext>;
  mockAppend: jest.Mock;
} => {
  const { createLog, prependAllLogEntries, mockAppend } = createMockLogContext();

  const middleware: Middleware<unknown, IRouterParamContext> = async (ctx, next) => {
    // @ts-expect-error -- mock log context
    ctx.createLog = createLog;
    // @ts-expect-error -- mock log context
    ctx.prependAllLogEntries = prependAllLogEntries;
    return next();
  };

  return { middleware, mockAppend };
};

const createRequesterWithMocks = ({
  interactionEvent = InteractionEvent.SignIn,
  adaptiveMfaEnabled = false,
  user = mockUser,
  mfa = mockSignInExperience.mfa,
  singleSignOnEnabled = mockSignInExperience.singleSignOnEnabled,
  passwordExpiration = { enabled: false },
  interactionResult = {},
  persistInteractionResult = false,
  trustedDevicePolicy = { enabled: false, durationDays: 30 },
}: {
  interactionEvent?: InteractionEvent;
  adaptiveMfaEnabled?: boolean;
  user?: typeof mockUser;
  mfa?: Mfa;
  singleSignOnEnabled?: boolean;
  passwordExpiration?: { enabled: boolean; validPeriodDays?: number };
  interactionResult?: Record<string, unknown>;
  persistInteractionResult?: boolean;
  trustedDevicePolicy?: { enabled: boolean; durationDays: number };
} = {}) => {
  const mockedInteractionDetails: {
    params: { client_id: string };
    jti: string;
    result: Record<string, unknown>;
  } = {
    params: { client_id: 'client_id' },
    jti: 'jti',
    result: {
      interactionEvent,
      userId: user.id,
      ...interactionResult,
    },
  };
  const interactionDetails = jest.fn().mockImplementation(async () => mockedInteractionDetails);
  const provider = createMockProvider(interactionDetails);

  if (persistInteractionResult) {
    (provider.interactionResult as jest.Mock).mockImplementation(
      async (
        _request: unknown,
        _response: unknown,
        result: Record<string, unknown>,
        options?: { mergeWithLastSubmission?: boolean }
      ) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        mockedInteractionDetails.result = options?.mergeWithLastSubmission
          ? { ...mockedInteractionDetails.result, ...result }
          : result;
        return 'redirectTo';
      }
    );
  }

  const userGeoLocations = {
    upsertUserGeoLocation: jest.fn().mockResolvedValue(null),
  };
  const userSignInCountries = {
    upsertUserSignInCountry: jest.fn().mockResolvedValue(null),
    pruneUserSignInCountriesByUserId: jest.fn().mockResolvedValue(null),
  };
  const users = {
    findUserById: jest.fn().mockResolvedValue(user),
    updateUserById: jest.fn().mockResolvedValue(user),
    hasUser: jest.fn().mockResolvedValue(false),
    hasUserWithEmail: jest.fn().mockResolvedValue(false),
    hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
    hasUserWithIdentity: jest.fn().mockResolvedValue(false),
  };
  const signInExperiences = {
    findDefaultSignInExperience: jest.fn().mockResolvedValue({
      ...mockSignInExperience,
      adaptiveMfa: { enabled: adaptiveMfaEnabled },
      mfa,
      singleSignOnEnabled,
      passwordExpiration,
    }),
  };
  const getEffectivePolicy = jest.fn().mockResolvedValue(trustedDevicePolicy);
  const validateCredential = jest.fn();
  const createCredential = jest.fn();
  const updateMetadata = jest.fn();

  const tenant = new MockTenant(
    provider,
    {
      users,
      signInExperiences,
      userGeoLocations,
      userSignInCountries,
    },
    undefined,
    {
      trustedDevicePolicy: {
        getEffectivePolicy,
      },
      trustedDevices: { validateCredential, createCredential, updateMetadata },
    }
  );

  const { middleware: logMiddleware, mockAppend } = createLogMiddleware();
  const requester = createRequester({
    anonymousRoutes: experienceRoutes,
    tenantContext: tenant,
    middlewares: [logMiddleware],
  });

  return {
    requester,
    userGeoLocations,
    userSignInCountries,
    mockAppend,
    users,
    provider,
    getEffectivePolicy,
    validateCredential,
    createCredential,
    updateMetadata,
  };
};

const createMfaRequiredRequester = () => {
  const user = {
    ...mockUser,
    mfaVerifications: [mockUserTotpMfaVerification],
  };

  return createRequesterWithMocks({
    user,
    mfa: {
      policy: MfaPolicy.Mandatory,
      factors: [MfaFactor.TOTP],
    },
  }).requester;
};

describe('POST /experience/profile', () => {
  it('should keep MFA guard for non-social profile updates during sign-in', async () => {
    const requester = createMfaRequiredRequester();
    const response = await requester.post('/experience/profile').send({
      type: 'password',
      value: 'Password123',
    });

    expect(response.status).toBe(403);
  });

  it('should keep identified-user guard for social profile updates during sign-in', async () => {
    const { requester } = createRequesterWithMocks({
      /* @ts-expect-error -- override user with empty object to simulate missing user scenario */
      user: {},
      mfa: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.TOTP],
      },
    });

    const response = await requester.post('/experience/profile').send({
      type: 'social',
      verificationId: 'any-social-verification-id',
    });

    expect(response.status).toBe(404);
    expect(response.text).toContain('User identifier not found');
  });
});

describe('POST /experience/submit', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const setDevFeaturesEnabled = (enabled: boolean) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = enabled;
  };

  afterEach(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
    jest.useRealTimers();
  });

  it('should record geo context when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      mockUser.id,
      35.6762,
      139.6503
    );
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should record geo location and sign-in country after successful sign-in', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      mockUser.id,
      35.6762,
      139.6503
    );
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should append adaptive MFA context to submit audit log', async () => {
    setDevFeaturesEnabled(true);
    const { requester, mockAppend } = createRequesterWithMocks({ adaptiveMfaEnabled: true });

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503')
      .set('x-logto-cf-bot-score', '42')
      .set('x-logto-cf-bot-verified', 'true');

    expect(response.status).toBe(200);
    expect(mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        adaptiveMfaContext: {
          location: {
            country: 'JP',
            latitude: 35.6762,
            longitude: 139.6503,
          },
          ipRiskSignals: {
            botScore: 42,
            botVerified: true,
          },
        },
      })
    );
  });

  it('should append adaptive MFA result to submit audit log', async () => {
    setDevFeaturesEnabled(true);
    const { requester, mockAppend } = createRequesterWithMocks({ adaptiveMfaEnabled: true });

    const response = await requester.post('/experience/submit').set('x-logto-cf-bot-score', '10');

    expect(response.status).toBe(200);
    const adaptiveMfaResult = mockAppend.mock.calls
      .map(
        ([payload]) =>
          (payload as { adaptiveMfaResult?: { requiresMfa: boolean; triggeredRules: unknown[] } })
            .adaptiveMfaResult
      )
      .find(Boolean);

    expect(adaptiveMfaResult?.requiresMfa).toBe(true);
    expect(adaptiveMfaResult?.triggeredRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'untrusted_ip' })])
    );
  });

  it('should allow zero coordinates and record them', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '0')
      .set('x-logto-cf-longitude', '0');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(mockUser.id, 0, 0);
  });

  it('should skip invalid coordinates but still record valid country', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', 'abc')
      .set('x-logto-cf-longitude', '181');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should skip out-of-range latitude but still record valid country', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '91')
      .set('x-logto-cf-longitude', '10');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should skip invalid country codes but record coordinates', async () => {
    setDevFeaturesEnabled(true);
    const invalidCountries = ['JPN', 'jpn'];

    for (const country of invalidCountries) {
      const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

      // eslint-disable-next-line no-await-in-loop
      const response = await requester
        .post('/experience/submit')
        .set('x-logto-cf-country', country)
        .set('x-logto-cf-latitude', '35.6762')
        .set('x-logto-cf-longitude', '139.6503');

      expect(response.status).toBe(200);
      expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
        mockUser.id,
        35.6762,
        139.6503
      );
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(
        mockUser.id,
        undefined
      );
    }
  });

  it('should normalize lowercase country codes', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'jp')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should record country when coordinates are missing', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester.post('/experience/submit').set('x-logto-cf-country', 'JP');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should skip recording coordinates when only latitude is provided', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-latitude', '51.5074');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(
      mockUser.id,
      undefined
    );
  });

  it('should record coordinates when country is missing', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-latitude', '51.5074')
      .set('x-logto-cf-longitude', '-0.1278');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      mockUser.id,
      51.5074,
      -0.1278
    );
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(
      mockUser.id,
      undefined
    );
  });

  it('should skip recording when no geo headers are provided', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks();

    const response = await requester.post('/experience/submit');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
    expect(userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
  });

  it('should record geo context when adaptive MFA is disabled', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks({
      adaptiveMfaEnabled: false,
    });

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      mockUser.id,
      35.6762,
      139.6503
    );
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it('should record geo context for register interactions', async () => {
    setDevFeaturesEnabled(true);
    const { requester, userGeoLocations, userSignInCountries } = createRequesterWithMocks({
      interactionEvent: InteractionEvent.Register,
    });

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'JP')
      .set('x-logto-cf-latitude', '35.6762')
      .set('x-logto-cf-longitude', '139.6503');

    expect(response.status).toBe(200);
    expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
      mockUser.id,
      35.6762,
      139.6503
    );
    expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
  });

  it.each(eligibleTrustedDeviceVerificationCases)(
    'should create a trusted device after eligible $name verification and explicit opt-in',
    async ({ factor, mfaVerification, verificationRecord }) => {
      setDevFeaturesEnabled(true);
      const user = {
        ...mockUser,
        mfaVerifications: mfaVerification ? [mfaVerification] : [],
      };
      const { requester, createCredential } = createRequesterWithMocks({
        user,
        mfa: { policy: MfaPolicy.Mandatory, factors: [factor] },
        interactionResult: { verificationRecords: [verificationRecord] },
        trustedDevicePolicy: { enabled: true, durationDays: 30 },
      });

      const response = await requester
        .post('/experience/submit')
        .set('User-Agent', 'Trusted device test browser')
        .set('x-logto-cf-country', 'us')
        .set('x-logto-cf-city', 'Portland')
        .send({ createTrustedDevice: true });

      expect(response.status).toBe(200);
      const payload = createCredential.mock.calls[0]?.[0] as
        | {
            ctx?: unknown;
            userId?: string;
            userAgent?: string;
            ip?: string;
            country?: string;
            city?: string;
          }
        | undefined;
      expect(payload).toMatchObject({
        userId: user.id,
        userAgent: 'Trusted device test browser',
        country: 'US',
        city: 'Portland',
      });
      expect(payload?.ctx).toBeDefined();
      expect(typeof payload?.ip).toBe('string');
    }
  );

  it('should default trusted-device intent to false', async () => {
    setDevFeaturesEnabled(true);
    const user = {
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification],
    };
    const { requester, createCredential } = createRequesterWithMocks({
      user,
      mfa: { policy: MfaPolicy.Mandatory, factors: [MfaFactor.TOTP] },
      interactionResult: {
        verificationRecords: [
          {
            id: 'totp-verification-id',
            type: VerificationType.TOTP,
            userId: user.id,
            verified: true,
          },
        ],
      },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });

    const response = await requester.post('/experience/submit');

    expect(response.status).toBe(200);
    expect(createCredential).not.toHaveBeenCalled();
  });

  it('should not treat trusted-device intent as MFA proof', async () => {
    setDevFeaturesEnabled(true);
    const user = {
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification],
    };
    const { requester, createCredential } = createRequesterWithMocks({
      user,
      mfa: { policy: MfaPolicy.Mandatory, factors: [MfaFactor.TOTP] },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });

    const response = await requester.post('/experience/submit').send({ createTrustedDevice: true });

    expect(response.status).toBe(403);
    expect(createCredential).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'TOTP',
      mfaData: {
        mfaEnabled: true,
        totp: { type: MfaFactor.TOTP, secret: 'totp-secret' },
      },
      factor: MfaFactor.TOTP,
    },
    {
      name: 'WebAuthn',
      mfaData: {
        mfaEnabled: true,
        webAuthn: [
          {
            type: MfaFactor.WebAuthn,
            rpId: 'logto.test',
            credentialId: 'credential-id',
            publicKey: 'public-key',
            counter: 0,
            agent: 'test-agent',
            transports: [],
          },
        ],
      },
      factor: MfaFactor.WebAuthn,
    },
  ])(
    'should create a trusted device after eligible $name binding and explicit opt-in',
    async ({ mfaData, factor }) => {
      setDevFeaturesEnabled(true);
      const { requester, createCredential } = createRequesterWithMocks({
        interactionEvent: InteractionEvent.Register,
        mfa: { policy: MfaPolicy.Mandatory, factors: [factor] },
        interactionResult: { mfa: mfaData },
        trustedDevicePolicy: { enabled: true, durationDays: 30 },
      });

      const response = await requester
        .post('/experience/submit')
        .send({ createTrustedDevice: true });

      expect(response.status).toBe(200);
      expect(createCredential).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser.id })
      );
    }
  );

  it('should exclude backup-code verification from trusted-device creation', async () => {
    setDevFeaturesEnabled(true);
    const user = {
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification, mockUserBackupCodeMfaVerification],
    };
    const { requester, createCredential } = createRequesterWithMocks({
      user,
      mfa: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
      },
      interactionResult: {
        verificationRecords: [
          {
            id: 'backup-code-verification-id',
            type: VerificationType.BackupCode,
            userId: user.id,
            code: 'code',
          },
        ],
      },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });

    const response = await requester.post('/experience/submit').send({ createTrustedDevice: true });

    expect(response.status).toBe(200);
    expect(createCredential).not.toHaveBeenCalled();
  });

  it('should exclude a verified MFA factor that is disabled in the sign-in experience', async () => {
    setDevFeaturesEnabled(true);
    const user = {
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification],
    };
    const { requester, createCredential } = createRequesterWithMocks({
      user,
      mfa: { policy: MfaPolicy.Mandatory, factors: [] },
      interactionResult: {
        verificationRecords: [
          {
            id: 'totp-verification-id',
            type: VerificationType.TOTP,
            userId: user.id,
            verified: true,
          },
        ],
      },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });

    const response = await requester.post('/experience/submit').send({ createTrustedDevice: true });

    expect(response.status).toBe(200);
    expect(createCredential).not.toHaveBeenCalled();
  });

  it('should not treat a BindMfa-templated profile identifier as an MFA binding', async () => {
    setDevFeaturesEnabled(true);
    const primaryEmail = 'profile-only@logto.dev';
    const user = {
      ...mockUser,
      primaryEmail: null,
      mfaVerifications: [],
    };
    const { requester, createCredential } = createRequesterWithMocks({
      user,
      mfa: { policy: MfaPolicy.Mandatory, factors: [] },
      interactionResult: {
        profile: { primaryEmail },
        verificationRecords: [
          {
            id: 'email-verification-id',
            type: VerificationType.EmailVerificationCode,
            identifier: { type: SignInIdentifier.Email, value: primaryEmail },
            templateType: TemplateType.BindMfa,
            verified: true,
          },
        ],
      },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });

    const response = await requester.post('/experience/submit').send({ createTrustedDevice: true });

    expect(response.status).toBe(200);
    expect(createCredential).not.toHaveBeenCalled();
  });

  it('should update a fulfilling trusted device best effort without creating a duplicate', async () => {
    setDevFeaturesEnabled(true);
    const user = {
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification],
    };
    const { requester, createCredential, updateMetadata } = createRequesterWithMocks({
      user,
      mfa: { policy: MfaPolicy.Mandatory, factors: [MfaFactor.TOTP] },
      interactionResult: {
        trustedDeviceFulfillment: {
          userId: user.id,
          trustedDeviceId: 'trusted-device-id',
          fulfilledAt: Date.now(),
        },
      },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });
    updateMetadata.mockRejectedValueOnce(new Error('trusted-device metadata update failed'));

    const response = await requester
      .post('/experience/submit')
      .set('x-logto-cf-country', 'US')
      .send({ createTrustedDevice: true });

    expect(response.status).toBe(200);
    expect(updateMetadata).toHaveBeenCalledWith(
      'trusted-device-id',
      user.id,
      expect.objectContaining({ country: 'US' })
    );
    expect(createCredential).not.toHaveBeenCalled();
  });

  it('should keep submit successful when trusted-device creation fails', async () => {
    setDevFeaturesEnabled(true);
    const user = {
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification],
    };
    const { requester, createCredential } = createRequesterWithMocks({
      user,
      mfa: { policy: MfaPolicy.Mandatory, factors: [MfaFactor.TOTP] },
      interactionResult: {
        verificationRecords: [
          {
            id: 'totp-verification-id',
            type: VerificationType.TOTP,
            userId: user.id,
            verified: true,
          },
        ],
      },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });
    createCredential.mockRejectedValueOnce(new Error('trusted-device creation failed'));

    const response = await requester.post('/experience/submit').send({ createTrustedDevice: true });

    expect(response.status).toBe(200);
    expect(createCredential).toHaveBeenCalledTimes(1);
  });

  it('should not create a trusted device when the complete interaction fails', async () => {
    setDevFeaturesEnabled(true);
    const user = {
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification],
    };
    const { requester, provider, createCredential } = createRequesterWithMocks({
      user,
      mfa: { policy: MfaPolicy.Mandatory, factors: [MfaFactor.TOTP] },
      interactionResult: {
        verificationRecords: [
          {
            id: 'totp-verification-id',
            type: VerificationType.TOTP,
            userId: user.id,
            verified: true,
          },
        ],
      },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });
    (provider.interactionResult as jest.Mock).mockRejectedValueOnce(
      new Error('interaction submission failed')
    );

    const response = await requester.post('/experience/submit').send({ createTrustedDevice: true });

    expect(response.status).toBe(500);
    expect(createCredential).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'email',
      factor: MfaFactor.EmailVerificationCode,
      verificationType: VerificationType.EmailVerificationCode,
      identifierType: SignInIdentifier.Email,
      identifierValue: 'bind-mfa@logto.dev',
      updatePatch: { primaryEmail: 'bind-mfa@logto.dev' },
    },
    {
      name: 'phone',
      factor: MfaFactor.PhoneVerificationCode,
      verificationType: VerificationType.PhoneVerificationCode,
      identifierType: SignInIdentifier.Phone,
      identifierValue: '13100000000',
      updatePatch: { primaryPhone: '13100000000' },
    },
  ])(
    'should allow adaptive MFA submit after binding $name via /experience/profile/mfa',
    async ({ factor, verificationType, identifierType, identifierValue, updatePatch }) => {
      setDevFeaturesEnabled(true);
      const verificationId = `mock-${identifierType}-verification-id`;
      const user = {
        ...mockUser,
        primaryEmail: null,
        primaryPhone: null,
        mfaVerifications: [],
      };

      const { requester, users, mockAppend, createCredential } = createRequesterWithMocks({
        adaptiveMfaEnabled: true,
        user,
        mfa: {
          policy: mockSignInExperience.mfa.policy,
          factors: [factor],
        },
        singleSignOnEnabled: false,
        interactionResult: {
          verificationRecords: [
            {
              id: verificationId,
              type: verificationType,
              identifier: {
                type: identifierType,
                value: identifierValue,
              },
              templateType: TemplateType.BindMfa,
              verified: true,
            },
          ],
        },
        persistInteractionResult: true,
        trustedDevicePolicy: { enabled: true, durationDays: 30 },
      });

      const bindResponse = await requester.post('/experience/profile/mfa').send({
        type: factor,
        verificationId,
      });
      expect(bindResponse.status).toBe(204);

      const submitResponse = await requester
        .post('/experience/submit')
        .set('x-logto-cf-bot-score', '10')
        .send({ createTrustedDevice: true });
      expect(submitResponse.status).toBe(200);

      expect(users.updateUserById).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining(updatePatch)
      );
      const adaptiveMfaResult = mockAppend.mock.calls
        .map(
          ([payload]) =>
            (payload as { adaptiveMfaResult?: { requiresMfa: boolean } }).adaptiveMfaResult
        )
        .find(Boolean);
      expect(adaptiveMfaResult?.requiresMfa).toBe(true);
      expect(createCredential).toHaveBeenCalledWith(expect.objectContaining({ userId: user.id }));
    }
  );

  it('should expose only trusted-device creation availability for an identified user', async () => {
    setDevFeaturesEnabled(true);
    const { requester, getEffectivePolicy } = createRequesterWithMocks({
      interactionResult: {
        trustedDeviceFulfillment: {
          userId: mockUser.id,
          trustedDeviceId: 'internal-device-id',
          fulfilledAt: Date.now(),
        },
      },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });

    const response = await requester.get('/experience/interaction');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      trustedDevice: { canCreate: true, durationDays: 30 },
    });
    expect(response.body).not.toHaveProperty('trustedDeviceFulfillment');
    expect(getEffectivePolicy).toHaveBeenCalledWith(mockUser.id);
  });

  it('should expose disabled creation without a duration when effective policy disallows it', async () => {
    setDevFeaturesEnabled(true);
    const { requester } = createRequesterWithMocks({
      trustedDevicePolicy: { enabled: false, durationDays: 30 },
    });

    const response = await requester.get('/experience/interaction');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ trustedDevice: { canCreate: false } });
    expect(response.body.trustedDevice).not.toHaveProperty('durationDays');
  });

  it('should omit trusted-device interaction data and behavior when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
    const user = {
      ...mockUser,
      mfaVerifications: [mockUserTotpMfaVerification],
    };
    const { requester, createCredential, getEffectivePolicy } = createRequesterWithMocks({
      user,
      mfa: { policy: MfaPolicy.Mandatory, factors: [MfaFactor.TOTP] },
      interactionResult: {
        verificationRecords: [
          {
            id: 'totp-verification-id',
            type: VerificationType.TOTP,
            userId: user.id,
            verified: true,
          },
        ],
      },
      trustedDevicePolicy: { enabled: true, durationDays: 30 },
    });

    const interactionResponse = await requester.get('/experience/interaction');
    const submitResponse = await requester
      .post('/experience/submit')
      .send({ createTrustedDevice: true });

    expect(interactionResponse.status).toBe(200);
    expect(interactionResponse.body).not.toHaveProperty('trustedDevice');
    expect(submitResponse.status).toBe(200);
    expect(getEffectivePolicy).not.toHaveBeenCalled();
    expect(createCredential).not.toHaveBeenCalled();
  });
});
/* eslint-enable max-lines */
