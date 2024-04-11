import fs from 'node:fs/promises';
import { createServer, type RequestListener } from 'node:http';

import { mockConnectorFilePaths, type SendMessagePayload } from '@logto/connector-kit';
import {
  type UserProfile,
  type JsonObject,
  type UsersPasswordEncryptionMethod,
} from '@logto/schemas';
import { HTTPError } from 'ky';

import { createUser } from '#src/api/index.js';
import { generateUsername } from '#src/utils.js';

export const createUserByAdmin = async (
  payload: {
    username?: string;
    password?: string;
    primaryEmail?: string;
    primaryPhone?: string;
    name?: string;
    passwordDigest?: string;
    passwordAlgorithm?: UsersPasswordEncryptionMethod;
    customData?: JsonObject;
    profile?: UserProfile;
  } = {}
) => {
  const { username, name, ...rest } = payload;

  return createUser({
    ...rest,
    username: username ?? generateUsername(),
    name: name ?? username ?? 'John',
  });
};

type ConnectorMessageRecord = {
  phone?: string;
  address?: string;
  code: string;
  type: string;
  payload: SendMessagePayload;
};

/**
 * Read the most recent connector message record from file system that is created by mock connectors.
 *
 * @param forType The type of connector to read message from.
 * @returns A promise that resolves to the connector message record.
 */
export const readConnectorMessage = async (
  forType: keyof typeof mockConnectorFilePaths
): Promise<ConnectorMessageRecord> => {
  const buffer = await fs.readFile(mockConnectorFilePaths[forType]);
  const content = buffer.toString();

  // For test use only
  // eslint-disable-next-line no-restricted-syntax
  return JSON.parse(content) as ConnectorMessageRecord;
};

/**
 * Remove the connector message record file from file system. If the file does not exist, do nothing.
 *
 * @param forType The type of connector to remove message from.
 * @returns A promise that resolves to void.
 */
export const removeConnectorMessage = async (
  forType: keyof typeof mockConnectorFilePaths
): Promise<void> => {
  try {
    await fs.unlink(mockConnectorFilePaths[forType]);
  } catch {
    // Do nothing
  }
};

type ExpectedErrorInfo = {
  code: string;
  status: number;
  messageIncludes?: string;
};

export const expectRejects = async <T = void>(
  promise: Promise<unknown>,
  expected: ExpectedErrorInfo
) => {
  try {
    await promise;
  } catch (error: unknown) {
    return expectRequestError<T>(error, expected);
  }

  fail();
};

const expectRequestError = async <T = void>(error: unknown, expected: ExpectedErrorInfo) => {
  const { code, status, messageIncludes } = expected;

  if (!(error instanceof HTTPError)) {
    fail('Error should be an instance of RequestError');
  }

  // JSON.parse returns `any`. Directly use `as` since we've already know the response body structure.
  // eslint-disable-next-line no-restricted-syntax
  const body = (await error.response.json()) as {
    code: string;
    message: string;
    data: T;
  };

  expect(body.code).toEqual(code);

  expect(error.response.status).toEqual(status);

  if (messageIncludes) {
    expect(body.message.includes(messageIncludes)).toBeTruthy();
  }

  return body.data;
};

const defaultRequestListener: RequestListener = (request, response) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  response.statusCode = 204;
  response.end();
};

export const createMockServer = (port: number, requestListener?: RequestListener) => {
  const server = createServer(requestListener ?? defaultRequestListener);

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
