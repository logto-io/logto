import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import api from '../api';

import { updateProfileWithVerificationCode, verifyAndUpdateProfileWithVerificationCode } from '.';
import { experienceApiRoutes } from './const';
import { identifyUser, submitInteraction, updateProfile } from './interaction';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('./interaction', () => ({
  identifyAndSubmitInteraction: jest.fn(),
  identifyUser: jest.fn(),
  initInteraction: jest.fn(),
  submitInteraction: jest.fn(),
  updateInteractionEvent: jest.fn(),
  updateProfile: jest.fn(),
}));

const mockedApiPost = api.post as jest.MockedFunction<typeof api.post>;
const mockedSubmitInteraction = submitInteraction as jest.MockedFunction<typeof submitInteraction>;

const verificationCodePayload = {
  identifier: { type: SignInIdentifier.Email, value: 'foo@logto.io' },
  code: '123456',
  verificationId: 'verification-id',
} as const;

describe('verification code profile APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApiPost.mockReturnValue({
      json: jest.fn().mockResolvedValue({ verificationId: 'verified-id' }),
    } as unknown as ReturnType<typeof api.post>);
  });

  it('verifies and updates the profile without submitting the interaction', async () => {
    await verifyAndUpdateProfileWithVerificationCode(
      verificationCodePayload,
      InteractionEvent.Register
    );

    expect(mockedApiPost).toBeCalledWith(
      `${experienceApiRoutes.verification}/verification-code/verify`,
      { json: verificationCodePayload }
    );
    expect(updateProfile).toBeCalledWith({
      type: SignInIdentifier.Email,
      verificationId: 'verified-id',
    });
    expect(identifyUser).toBeCalledTimes(1);
    expect(mockedSubmitInteraction).not.toBeCalled();
  });

  it('submits once after verifying and updating the profile in a regular continue flow', async () => {
    mockedSubmitInteraction.mockResolvedValue({ redirectTo: '/callback' });

    await expect(
      updateProfileWithVerificationCode(verificationCodePayload, InteractionEvent.SignIn)
    ).resolves.toEqual({ redirectTo: '/callback' });

    expect(identifyUser).not.toBeCalled();
    expect(mockedSubmitInteraction).toBeCalledTimes(1);
  });
});
