import { PasscodeType } from '@logto/schemas';
import { customAlphabet, nanoid } from 'nanoid';

import {
  deletePasscodeById,
  findUnconsumedPasscodeBySessionIdAndType,
  insertPasscode,
} from '@/queries/passcode';

const randomCode = customAlphabet('1234567890', 6);

export const createPasscode = async (
  sessionId: string,
  type: PasscodeType,
  payload: { phone: string } | { email: string }
) => {
  // Disable existing passcodes.
  const passcode = await findUnconsumedPasscodeBySessionIdAndType(sessionId, type);
  if (passcode) {
    await deletePasscodeById(passcode.id);
  }

  return insertPasscode({
    id: nanoid(),
    sessionId,
    type,
    code: randomCode(),
    ...payload,
  });
};
