import { logtoUrl } from '#src/constants.js';

describe('smoke testing', () => {
  it('opens with app element', async () => {
    await page.goto(new URL('/sign-in', logtoUrl).href);
    await expect(page.$('#app')).resolves.not.toBeNull();
  });
});
