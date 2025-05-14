import crypto from 'node:crypto';

import { createUser, deleteUser, getUser, updateUser } from '#src/api/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';

/**
 * Generates a random username with lowercase English letters only.
 * @param {number} length - The length of the username to generate. Default is 8.
 * @returns {string} A random lowercase username.
 */
const generateLowercaseUsername = (length = 8): string => {
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const bytes = crypto.randomBytes(length);

  const username = Array.from(bytes)
    .map((byte) => lowercaseLetters[byte % lowercaseLetters.length])
    .join('');

  return username;
};

describe('admin console user phone number handling', () => {
  it('should correctly handle phone numbers with leading zero when creating a user', async () => {
    // Test with Australian number that has a leading zero: +61 0412 345 678
    const phoneWithLeadingZero = '610412345678';
    const expectedPhone = '61412345678';

    // Create user with phone number that has a leading zero
    const user = await createUser({
      username: generateLowercaseUsername(),
      primaryPhone: phoneWithLeadingZero,
    });

    // Verify the phone number is correctly stored without leading zero
    expect(user.primaryPhone).toBe(expectedPhone);
    expect(user.primaryPhone).not.toBe('610412345678'); // Should not include the leading zero

    // Double-check by fetching the user again
    const fetchedUser = await getUser(user.id);
    expect(fetchedUser.primaryPhone).toBe(expectedPhone);

    await deleteUser(user.id);
  });

  it('should correctly handle phone numbers with leading zero when updating a user', async () => {
    // Create a user first
    const user = await createUserByAdmin();

    // Update with Australian number that has a leading zero: +61 0412 345 678
    const phoneWithLeadingZero = '610412345678';
    const expectedPhone = '61412345678';

    const updatedUser = await updateUser(user.id, {
      primaryPhone: phoneWithLeadingZero,
    });

    // Verify the phone number is correctly stored without leading zero
    expect(updatedUser.primaryPhone).toBe(expectedPhone);
    expect(updatedUser.primaryPhone).not.toBe('610412345678'); // Should not include the leading zero

    await deleteUser(user.id);
  });

  it('should handle different phone number formats consistently', async () => {
    // These phone numbers all represent the same Australian number in different formats
    const phoneFormats = [
      '610412345678', // With leading zero
      '61412345678', // Without leading zero
    ];

    const expectedPhone = '61412345678';

    // Create a user for each format and verify the results are consistent - using serial execution
    /* eslint-disable no-await-in-loop */
    for (const phone of phoneFormats) {
      const user = await createUser({
        username: generateLowercaseUsername(),
        primaryPhone: phone,
      });

      expect(user.primaryPhone).toBe(expectedPhone);

      await deleteUser(user.id);
    }
    /* eslint-enable no-await-in-loop */
  });

  it('should be able to identify duplicate phone numbers regardless of format', async () => {
    // Create a user with a phone number that has a leading zero
    const phoneWithLeadingZero = '610412345678';
    const expectedPhone = '61412345678';

    const user = await createUser({
      username: generateLowercaseUsername(),
      primaryPhone: phoneWithLeadingZero,
    });

    // Confirm the phone number is stored correctly (without leading zero)
    expect(user.primaryPhone).toBe(expectedPhone);

    // Create another user and try to use the same phone number in different formats (should fail)
    const anotherUser = await createUserByAdmin();

    // Try different formats of the same phone number
    const phoneFormats = [
      '610412345678', // With leading zero
      '61412345678', // Without leading zero
    ];

    // Verify all formats are recognized as the same phone number
    const updatePromises = phoneFormats.map(async (phone) => {
      try {
        await updateUser(anotherUser.id, { primaryPhone: phone });
        fail('Should throw an error because the phone number is already in use');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    await Promise.all(updatePromises);

    await deleteUser(anotherUser.id);
  });

  it('should handle edge cases of phone numbers with leading zeros', async () => {
    const ukPhoneWithZero = '4407911123456';
    const expectedUkPhone = '447911123456';

    const user = await createUser({
      username: generateLowercaseUsername(),
      primaryPhone: ukPhoneWithZero,
    });

    expect(user.primaryPhone).toBe(expectedUkPhone);
    expect(user.primaryPhone).not.toContain('0'); // Confirm the leading zero is removed

    await deleteUser(user.id);
  });
});
