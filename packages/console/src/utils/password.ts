import { passwordRegEx } from '@logto/core-kit';
import { nanoid } from 'nanoid';

// Note: password requires a minimum of 8 characters and contains a mix of letters, numbers, and symbols.
export const generateRandomPassword = (length = 8) => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let generated = nanoid(length);
  while (!passwordRegEx.test(generated)) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    generated = nanoid(length);
  }

  return generated;
};
