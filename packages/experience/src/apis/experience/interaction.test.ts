import api from '../api';

import { experienceApiRoutes } from './const';
import { setTrustedDeviceOptInDecision, submitInteraction } from './interaction';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const mockedApiPost = api.post as jest.MockedFunction<typeof api.post>;

describe('interaction experience APIs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([true, false])(
    'records trusted-device decision %s before submitting the interaction',
    async (trusted) => {
      const response = { redirectTo: '/callback' };
      const json = jest.fn().mockResolvedValue(response);
      mockedApiPost
        .mockReturnValueOnce({} as ReturnType<typeof api.post>)
        .mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

      await expect(setTrustedDeviceOptInDecision(trusted)).resolves.toEqual(response);

      expect(mockedApiPost).toHaveBeenNthCalledWith(
        1,
        `${experienceApiRoutes.profile}/trusted-device`,
        { json: { trusted } }
      );
      expect(mockedApiPost).toHaveBeenNthCalledWith(2, experienceApiRoutes.submit);
    }
  );

  it('does not submit when recording the trusted-device decision fails', async () => {
    const error = new Error('Failed to record trusted-device decision');
    mockedApiPost.mockRejectedValueOnce(error);

    await expect(setTrustedDeviceOptInDecision(true)).rejects.toBe(error);

    expect(mockedApiPost).toBeCalledTimes(1);
  });

  it('submits directly when trusted-device opt-in is not selected', async () => {
    const json = jest.fn().mockResolvedValue({ redirectTo: '/callback' });
    mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

    await submitInteraction();

    expect(mockedApiPost).toBeCalledTimes(1);
    expect(mockedApiPost).toBeCalledWith(experienceApiRoutes.submit);
  });
});
