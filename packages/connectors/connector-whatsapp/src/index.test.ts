import createConnector from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('WhatsApp SMS connector', () => {
  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });
});
