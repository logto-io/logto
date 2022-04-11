import { generateRandomString } from '.';

describe('util methods', () => {
  it('generateRandomString', () => {
    const random = generateRandomString();
    expect(random).not.toBeNull();
  });
});
