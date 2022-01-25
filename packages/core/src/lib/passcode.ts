import { PasscodeType } from '@logto/schemas';
import { customAlphabet, nanoid } from 'nanoid';

import {
  findUnusedPasscodeBySessionIdAndType,
  insertPasscode,
  updatePasscode,
} from '@/queries/passcode';

const randomCode = customAlphabet('1234567890', 6);

export const createPasscode = async (
  sessionId: string,
  type: PasscodeType,
  { phone, email }: { phone: string; email: string }
) => {
  if (!phone && !email) {
    throw new Error('Require phone or email.');
  }

  // Disable existing passcodes.
  const passcode = await findUnusedPasscodeBySessionIdAndType(sessionId, type);
  if (passcode) {
    await updatePasscode({
      where: { id: passcode.id },
      set: { used: true },
    });
  }

  return insertPasscode({
    id: nanoid(),
    sessionId,
    type,
    code: randomCode(),
  });
};
