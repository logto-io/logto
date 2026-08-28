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

  it('submits selected trusted-device intent with the interaction', async () => {
    const response = { redirectTo: '/callback' };
    const json = jest.fn().mockResolvedValue(response);
    mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

    await expect(submitInteraction({ createTrustedDevice: true })).resolves.toEqual(response);

    expect(mockedApiPost).toHaveBeenCalledWith(experienceApiRoutes.submit, {
      json: { createTrustedDevice: true },
    });
  });

  it('submits a cleared trusted-device intent with the interaction', async () => {
    const response = { redirectTo: '/callback' };
    const json = jest.fn().mockResolvedValue(response);
    mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

    await expect(submitInteraction({ createTrustedDevice: false })).resolves.toEqual(response);

    expect(mockedApiPost).toHaveBeenCalledWith(experienceApiRoutes.submit, {
      json: { createTrustedDevice: false },
    });
  });

  it('omits trusted-device intent when the current page has no opt-in', async () => {
    const json = jest.fn().mockResolvedValue({ redirectTo: '/callback' });
    mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

    await submitInteraction();

    expect(mockedApiPost).toBeCalledTimes(1);
    expect(mockedApiPost).toBeCalledWith(experienceApiRoutes.submit);
  });
});
