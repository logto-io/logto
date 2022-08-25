import createConnector from '.';
import { mockedConfig } from './mock';

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

describe('SMTP connector', () => {
  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });
});
