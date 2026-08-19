import api from '../api';

import { experienceApiRoutes } from './const';
import { getInteraction, submitInteraction } from './interaction';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApiGet = api.get as jest.MockedFunction<typeof api.get>;
const mockedApiPost = api.post as jest.MockedFunction<typeof api.post>;

describe('interaction experience APIs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('gets trusted-device creation availability from public interaction data', async () => {
    const response = { trustedDevice: { canCreate: true, durationDays: 30 } };
    const json = jest.fn().mockResolvedValue(response);
    mockedApiGet.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.get>);

    await expect(getInteraction()).resolves.toEqual(response);

    expect(mockedApiGet).toBeCalledWith(experienceApiRoutes.interaction, { signal: undefined });
    expect(json).toBeCalled();
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
