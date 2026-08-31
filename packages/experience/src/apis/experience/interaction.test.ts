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

  it('submits the interaction directly', async () => {
    const json = jest.fn().mockResolvedValue({ redirectTo: '/callback' });
    mockedApiPost.mockReturnValueOnce({ json } as unknown as ReturnType<typeof api.post>);

    await submitInteraction();

    expect(mockedApiPost).toBeCalledTimes(1);
    expect(mockedApiPost).toBeCalledWith(experienceApiRoutes.submit);
  });
});
