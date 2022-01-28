import { PasscodeType } from '@logto/schemas';
import { customAlphabet, nanoid } from 'nanoid';

import {
  deletePasscodesByIds,
  findUnconsumedPasscodesBySessionIdAndType,
  insertPasscode,
} from '@/queries/passcode';

export const passcodeLength = 6;
const randomCode = customAlphabet('1234567890', passcodeLength);

export const createPasscode = async (
  sessionId: string,
  type: PasscodeType,
  payload: { phone: string } | { email: string }
) => {
  // Disable existing passcodes.
  const passcodes = await findUnconsumedPasscodesBySessionIdAndType(sessionId, type);

  if (passcodes.length > 0) {
    await deletePasscodesByIds(passcodes.map(({ id }) => id));
  }

  return insertPasscode({
    id: nanoid(),
    sessionId,
    type,
    code: randomCode(),
    ...payload,
  });
};
