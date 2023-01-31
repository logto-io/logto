import fs from 'fs/promises';
import { createServer } from 'http';
import path from 'path';

import { mockSmsVerificationCodeFileName } from '@logto/connector-kit';
import type { User } from '@logto/schemas';
import { RequestError } from 'got';

import { createUser } from '#src/api/index.js';
import { generateUsername } from '#src/utils.js';

const temporaryVerificationCodeFilePath = path.join('/tmp', mockSmsVerificationCodeFileName);

export const createUserByAdmin = (
  username?: string,
  password?: string,
  primaryEmail?: string,
  primaryPhone?: string,
  name?: string,
  isAdmin = false
) => {
  return createUser({
    username: username ?? generateUsername(),
    password,
    name: name ?? username ?? 'John',
    primaryEmail,
    primaryPhone,
    isAdmin,
  }).json<User>();
};

type VerificationCodeRecord = {
  phone?: string;
  address?: string;
  code: string;
  type: string;
};

export const readVerificationCode = async (): Promise<VerificationCodeRecord> => {
  const buffer = await fs.readFile(temporaryVerificationCodeFilePath);
  const content = buffer.toString();

  // For test use only
  // eslint-disable-next-line no-restricted-syntax
  return JSON.parse(content) as VerificationCodeRecord;
};

export const removeVerificationCode = async (): Promise<void> => {
  try {
    await fs.unlink(temporaryVerificationCodeFilePath);
  } catch {
    // Do nothing
  }
};

export const expectRejects = async (
  promise: Promise<unknown>,
  code: string,
  messageIncludes?: string
) => {
  try {
    await promise;
  } catch (error: unknown) {
    expectRequestError(error, code, messageIncludes);

    return;
  }

  fail();
};

export const expectRequestError = (error: unknown, code: string, messageIncludes?: string) => {
  if (!(error instanceof RequestError)) {
    fail('Error should be an instance of RequestError');
  }

  // JSON.parse returns `any`. Directly use `as` since we've already know the response body structure.
  // eslint-disable-next-line no-restricted-syntax
  const body = JSON.parse(String(error.response?.body)) as {
    code: string;
    message: string;
  };

  expect(body.code).toEqual(code);

  if (messageIncludes) {
    expect(body.message.includes(messageIncludes)).toBeTruthy();
  }
};

export const createMockServer = (port: number) => {
  const server = createServer((request, response) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    response.statusCode = 204;
    response.end();
  });

  return {
    listen: async () =>
      new Promise((resolve) => {
        server.listen(port, () => {
          resolve(true);
        });
      }),
    close: async () =>
      new Promise((resolve) => {
        server.close(() => {
          resolve(true);
        });
      }),
  };
};
