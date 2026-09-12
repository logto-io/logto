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
import { getStepUpContext, initStepUp, sendStepUpVerificationCode } from './step-up';

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
});
