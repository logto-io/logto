import {
  AuthenticationContextMode,
  InteractionEvent,
  LogtoAcr,
  MfaFactor,
  MissingProfile,
  SignInIdentifier,
  VerificationType,
  type InteractionAuthenticationContext,
} from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes } from './const';
import { identifyAndSubmitInteraction } from './interaction';
import {
  getStepUpContext,
  initStepUp,
  sendStepUpVerificationCode,
  verifyStepUpPassword,
  verifyStepUpVerificationCode,
} from './step-up';

jest.mock('./interaction', () => ({
  __esModule: true,
  identifyAndSubmitInteraction: jest.fn(),
}));

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApiPut = api.put as jest.MockedFunction<typeof api.put>;
const mockedApiGet = api.get as jest.MockedFunction<typeof api.get>;
const mockedApiPost = api.post as jest.MockedFunction<typeof api.post>;
const mockedIdentifyAndSubmitInteraction = identifyAndSubmitInteraction as jest.MockedFunction<
  typeof identifyAndSubmitInteraction
>;

/** The fields the guard requires; `selectedAcr` and `mode` are optional on the wire. */
const requiredContext = {
  requestedAcrValues: [LogtoAcr.Mfa, LogtoAcr.FirstFactor],
  availableMethods: [VerificationType.Password, VerificationType.EmailVerificationCode],
  establishableMethods: [MissingProfile.password],
  enrollableFactors: [MfaFactor.TOTP],
  subjectProofConnectors: [{ type: 'social', connectorId: 'github' }],
  maskedIdentifiers: { email: 'f***@logto.io', phone: '+1 ***5678' },
} satisfies InteractionAuthenticationContext;

const authenticationContext = {
  ...requiredContext,
  selectedAcr: LogtoAcr.Mfa,
  mode: AuthenticationContextMode.StepUp,
} satisfies InteractionAuthenticationContext;

const mockPutResponse = (status: number, body?: unknown) => {
  const json = jest.fn().mockResolvedValue(body);
  mockedApiPut.mockResolvedValueOnce({ status, json } as unknown as Awaited<
    ReturnType<typeof api.put>
  >);

  return json;
};

const mockPostResponse = (body: unknown) => {
  const json = jest.fn().mockResolvedValue(body);
  mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

  return json;
};

const mockGetInteraction = (body: unknown) => {
  const json = jest.fn().mockResolvedValue(body);
  mockedApiGet.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.get>);

  return json;
};

describe('step-up experience APIs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initStepUp', () => {
    it('creates the sign-in interaction with only the interaction event', async () => {
      mockPutResponse(204);

      await initStepUp();

      expect(mockedApiPut).toBeCalledTimes(1);
      const [url, options] = mockedApiPut.mock.calls[0] ?? [];
      expect(url).toBe(experienceApiRoutes.prefix);
      // Pinned strictly: nothing that identifies the user may ride along.
      expect(options).toStrictEqual({ json: { interactionEvent: InteractionEvent.SignIn } });
    });

    it('resolves with an empty result on 204 without reading a body', async () => {
      const json = mockPutResponse(204);

      await expect(initStepUp()).resolves.toStrictEqual({});

      expect(json).not.toBeCalled();
    });

    it('resolves with the redirect target on 200', async () => {
      const json = mockPutResponse(200, { redirectTo: 'https://app.example/callback' });

      await expect(initStepUp()).resolves.toStrictEqual({
        redirectTo: 'https://app.example/callback',
      });

      expect(json).toBeCalledTimes(1);
    });
  });

  describe('getStepUpContext', () => {
    it('reads the interaction and returns the parsed authentication context', async () => {
      const json = mockGetInteraction({ authenticationContext });

      await expect(getStepUpContext()).resolves.toStrictEqual(authenticationContext);

      expect(mockedApiGet).toBeCalledTimes(1);
      expect(mockedApiGet).toBeCalledWith(experienceApiRoutes.interaction);
      expect(json).toBeCalledTimes(1);
    });

    it('strips unknown fields from the authentication context', async () => {
      mockGetInteraction({
        authenticationContext: {
          ...authenticationContext,
          unexpected: 'field',
          maskedIdentifiers: { ...authenticationContext.maskedIdentifiers, username: 'foo' },
        },
      });

      const result = await getStepUpContext();

      expect(result).toStrictEqual(authenticationContext);
      expect(result).not.toHaveProperty('unexpected');
      expect(result?.maskedIdentifiers).not.toHaveProperty('username');
    });

    it('keeps optional fields absent when the server omits them', async () => {
      mockGetInteraction({ authenticationContext: requiredContext });

      const result = await getStepUpContext();

      expect(result).toStrictEqual(requiredContext);
      expect(result).not.toHaveProperty('selectedAcr');
      expect(result).not.toHaveProperty('mode');
    });

    it('returns undefined when the interaction carries no authentication context', async () => {
      mockGetInteraction({});

      await expect(getStepUpContext()).resolves.toBeUndefined();
    });

    it.each([
      ['availableMethods holds an unknown type', { availableMethods: ['Unknown'] }],
      ['requestedAcrValues holds a non-Logto ACR', { requestedAcrValues: ['urn:custom:acr'] }],
      ['selectedAcr is not a Logto ACR', { selectedAcr: 'urn:custom:acr' }],
      ['mode is unknown', { mode: 'signIn' }],
      ['enrollableFactors holds an unknown factor', { enrollableFactors: ['Unknown'] }],
      ['establishableMethods holds an unknown profile', { establishableMethods: ['unknown'] }],
      [
        'subjectProofConnectors holds an unknown connector type',
        { subjectProofConnectors: [{ type: 'oidc', connectorId: 'okta' }] },
      ],
      ['maskedIdentifiers is missing', { maskedIdentifiers: undefined }],
      ['availableMethods is missing', { availableMethods: undefined }],
    ])('returns undefined when %s', async (_, override) => {
      mockGetInteraction({ authenticationContext: { ...authenticationContext, ...override } });

      await expect(getStepUpContext()).resolves.toBeUndefined();
    });
  });

  describe('sendStepUpVerificationCode', () => {
    it.each([SignInIdentifier.Email, SignInIdentifier.Phone] as const)(
      'sends the %s verification code by identifier type only and returns the verification ID',
      async (type) => {
        const response = { verificationId: 'verification-id' };
        const json = jest.fn().mockResolvedValue(response);
        mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

        await expect(sendStepUpVerificationCode(type)).resolves.toEqual(response);

        expect(mockedApiPost).toBeCalledTimes(1);
        expect(mockedApiPost).toBeCalledWith(
          `${experienceApiRoutes.verification}/verification-code`,
          { json: { interactionEvent: InteractionEvent.SignIn, identifier: { type } } }
        );
        expect(json).toBeCalledTimes(1);

        const [, options] = mockedApiPost.mock.calls[0] ?? [];
        // `toBeCalledWith` uses recursive equality, so pin the exact shape: no identifier value.
        expect(options).toStrictEqual({
          json: { interactionEvent: InteractionEvent.SignIn, identifier: { type } },
        });
      }
    );
  });
  describe('verifyStepUpPassword', () => {
    it('sends the password alone and completes the interaction with the verified record', async () => {
      const submitResult = { redirectTo: 'https://logto.io/callback' };
      mockPostResponse({ verificationId: 'password-verification-id' });
      mockedIdentifyAndSubmitInteraction.mockResolvedValueOnce(submitResult);

      await expect(verifyStepUpPassword('password')).resolves.toEqual(submitResult);

      expect(mockedApiPost).toBeCalledTimes(1);
      const [url, options] = mockedApiPost.mock.calls[0] ?? [];
      expect(url).toBe(`${experienceApiRoutes.verification}/password`);
      // Pinned strictly: no identifier, raw or masked, rides along with the password.
      expect(options).toStrictEqual({ json: { password: 'password' } });
      expect(mockedIdentifyAndSubmitInteraction).toBeCalledTimes(1);
      expect(mockedIdentifyAndSubmitInteraction).toBeCalledWith({
        verificationId: 'password-verification-id',
      });
    });

    it('does not identify or submit when the password is rejected', async () => {
      const error = new Error('Invalid credentials');
      const json = jest.fn().mockRejectedValue(error);
      mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

      await expect(verifyStepUpPassword('wrong')).rejects.toThrow(error);

      expect(mockedIdentifyAndSubmitInteraction).not.toBeCalled();
    });
  });

  describe('verifyStepUpVerificationCode', () => {
    it.each([SignInIdentifier.Email, SignInIdentifier.Phone] as const)(
      'verifies the %s code by identifier type only and completes the interaction',
      async (type) => {
        const submitResult = { redirectTo: 'https://logto.io/callback' };
        mockPostResponse({ verificationId: 'verified-verification-id' });
        mockedIdentifyAndSubmitInteraction.mockResolvedValueOnce(submitResult);

        await expect(
          verifyStepUpVerificationCode({ type, code: '123456', verificationId: 'sent-id' })
        ).resolves.toEqual(submitResult);

        expect(mockedApiPost).toBeCalledTimes(1);
        const [url, options] = mockedApiPost.mock.calls[0] ?? [];
        expect(url).toBe(`${experienceApiRoutes.verification}/verification-code/verify`);
        // The raw primary email / phone never leaves the server, on the verify call either.
        expect(options).toStrictEqual({
          json: { identifier: { type }, code: '123456', verificationId: 'sent-id' },
        });
        // The record the verify call returns is the one that identifies the pinned subject.
        expect(mockedIdentifyAndSubmitInteraction).toBeCalledTimes(1);
        expect(mockedIdentifyAndSubmitInteraction).toBeCalledWith({
          verificationId: 'verified-verification-id',
        });
      }
    );

    it('does not identify or submit when the code is rejected', async () => {
      const error = new Error('Code mismatch');
      const json = jest.fn().mockRejectedValue(error);
      mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

      await expect(
        verifyStepUpVerificationCode({
          type: SignInIdentifier.Email,
          code: '000000',
          verificationId: 'sent-id',
        })
      ).rejects.toThrow(error);

      expect(mockedIdentifyAndSubmitInteraction).not.toBeCalled();
    });
  });
});
