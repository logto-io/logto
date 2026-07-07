import {
  InteractionEvent,
  SignInIdentifier,
  type OneTimeTokenVerificationVerifyPayload,
} from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes } from './const';
import { initInteraction } from './interaction';
import { signInWithOneTimeToken } from './one-time-token';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('./interaction', () => ({
  initInteraction: jest.fn(),
  identifyUser: jest.fn(),
}));

const mockedApiPost = api.post as jest.MockedFunction<typeof api.post>;
const mockedInitInteraction = initInteraction as jest.MockedFunction<typeof initInteraction>;

describe('one-time-token experience APIs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes a sign-in interaction before verifying one-time token sign-in', async () => {
    const payload = {
      token: 'token',
      identifier: { type: SignInIdentifier.Email, value: 'foo@logto.io' },
    } satisfies OneTimeTokenVerificationVerifyPayload;
    const response = { verificationId: 'verification-id' };
    const json = jest.fn().mockResolvedValue(response);

    mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

    await expect(signInWithOneTimeToken(payload)).resolves.toEqual(response);

    expect(mockedInitInteraction).toBeCalledWith(InteractionEvent.SignIn);
    expect(mockedApiPost).toBeCalledWith(
      `${experienceApiRoutes.verification}/one-time-token/verify`,
      {
        json: payload,
      }
    );
    expect(json).toBeCalled();
  });
});
