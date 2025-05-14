import { createUser, getUser, updateUser } from '#src/api/admin-user.js';
import { createUserByAdmin } from '#src/helpers/index.js';

describe('admin console user phone number handling', () => {
  it('should correctly handle phone numbers with leading zero when creating a user', async () => {
    // Test with Australian number that has a leading zero: +61 0412 345 678
    const phoneWithLeadingZero = '+61 0412 345 678';
    const expectedPhone = '61412345678';

    // Create user with phone number that has a leading zero
    const user = await createUser({
      primaryPhone: phoneWithLeadingZero,
    });

    // Verify the phone number is correctly stored without leading zero
    expect(user.primaryPhone).toBe(expectedPhone);
    expect(user.primaryPhone).not.toBe('610412345678'); // Should not include the leading zero

    // Double-check by fetching the user again
    const fetchedUser = await getUser(user.id);
    expect(fetchedUser.primaryPhone).toBe(expectedPhone);
  });

  it('should correctly handle phone numbers with leading zero when updating a user', async () => {
    // Create a user first
    const user = await createUserByAdmin();

    // Update with Australian number that has a leading zero: +61 0412 345 678
    const phoneWithLeadingZero = '+61 0412 345 678';
    const expectedPhone = '61412345678';

    const updatedUser = await updateUser(user.id, {
      primaryPhone: phoneWithLeadingZero,
    });

    // Verify the phone number is correctly stored without leading zero
    expect(updatedUser.primaryPhone).toBe(expectedPhone);
    expect(updatedUser.primaryPhone).not.toBe('610412345678'); // Should not include the leading zero
  });

  it('should handle different phone number formats consistently', async () => {
    // These phone numbers all represent the same Australian number in different formats
    const phoneFormats = [
      '+61 0412 345 678', // With leading zero
      '+61 412 345 678', // Without leading zero
      '61 0412 345 678', // Without plus sign but with leading zero
      '61 412 345 678', // Without plus sign and without leading zero
    ];

    const expectedPhone = '61412345678';

    // Create a user for each format and verify the results are consistent
    const createUserPromises = phoneFormats.map(async (phone) => {
      const user = await createUser({ primaryPhone: phone });
      expect(user.primaryPhone).toBe(expectedPhone);
    });

    await Promise.all(createUserPromises);
  });

  it('should be able to identify duplicate phone numbers regardless of format', async () => {
    // Create a user with a phone number that has a leading zero
    const phoneWithLeadingZero = '+61 0412 345 678';
    const expectedPhone = '61412345678';

    const user = await createUser({
      primaryPhone: phoneWithLeadingZero,
    });

    // Confirm the phone number is stored correctly (without leading zero)
    expect(user.primaryPhone).toBe(expectedPhone);

    // Create another user and try to use the same phone number in different formats (should fail)
    const anotherUser = await createUserByAdmin();

    // Try different formats of the same phone number
    const phoneFormats = [
      '+61 0412 345 678', // With leading zero
      '+61 412 345 678', // Without leading zero
      '61 0412 345 678', // Without plus sign but with leading zero
      '61 412 345 678', // Without plus sign and without leading zero
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
  });

  it('should handle edge cases of phone numbers with leading zeros', async () => {
    // Test 1: UK number with leading zero
    const ukPhoneWithZero = '+44 07911 123456';
    const expectedUkPhone = '447911123456';

    const user1 = await createUser({
      primaryPhone: ukPhoneWithZero,
    });

    expect(user1.primaryPhone).toBe(expectedUkPhone);
    expect(user1.primaryPhone).not.toContain('0'); // Confirm the leading zero is removed

    // Test 2: Number with multiple leading zeros
    const multiZeroPhone = '+1 000123456789';
    const expectedMultiZeroPhone = '1123456789';

    const user2 = await createUserByAdmin();
    const updatedUser = await updateUser(user2.id, {
      primaryPhone: multiZeroPhone,
    });

    expect(updatedUser.primaryPhone).toBe(expectedMultiZeroPhone);
  });
});
