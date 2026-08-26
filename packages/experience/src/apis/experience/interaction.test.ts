import api from '../api';

import { experienceApiRoutes } from './const';
import { submitInteraction } from './interaction';

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

  it('records selected trusted-device intent before submitting the interaction', async () => {
    const response = { redirectTo: '/callback' };
    const json = jest.fn().mockResolvedValue(response);
    mockedApiPost
      .mockReturnValueOnce({} as ReturnType<typeof api.post>)
      .mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

    await expect(submitInteraction({ createTrustedDevice: true })).resolves.toEqual(response);

    expect(mockedApiPost).toHaveBeenNthCalledWith(1, `${experienceApiRoutes.mfa}/trusted-device`);
    expect(mockedApiPost).toHaveBeenNthCalledWith(2, experienceApiRoutes.submit);
  });

  it('still submits when recording trusted-device intent fails', async () => {
    const response = { redirectTo: '/callback' };
    const json = jest.fn().mockResolvedValue(response);
    mockedApiPost
      .mockRejectedValueOnce(new Error('Failed to record trusted-device intent'))
      .mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

    await expect(submitInteraction({ createTrustedDevice: true })).resolves.toEqual(response);

    expect(mockedApiPost).toHaveBeenNthCalledWith(1, `${experienceApiRoutes.mfa}/trusted-device`);
    expect(mockedApiPost).toHaveBeenNthCalledWith(2, experienceApiRoutes.submit);
  });

  it('submits directly when trusted-device opt-in is not selected', async () => {
    const json = jest.fn().mockResolvedValue({ redirectTo: '/callback' });
    mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

    await submitInteraction();

    expect(mockedApiPost).toBeCalledTimes(1);
    expect(mockedApiPost).toBeCalledWith(experienceApiRoutes.submit);
  });
});
