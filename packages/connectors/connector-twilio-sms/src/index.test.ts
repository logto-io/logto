import createConnector from './index.js';
import { mockedConfig } from './mock.js';

const { jest } = import.meta;

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

describe('Twilio SMS connector', () => {
  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });
});
