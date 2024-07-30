/**
 * @fileoverview Integration tests for handling client authentication with multiple client secrets.
 * This test suite will test both the client authentication middleware and the inner workings of the
 * `oidc-provider` when handling client authentication.
 *
 * @see {@link file://./../../../../../core/src/middleware/koa-app-secret-transpilation.ts} for the middleware implementation.
 */

import assert from 'node:assert';

import { ApplicationType, token } from '@logto/schemas';
import { noop, removeUndefinedKeys } from '@silverhand/essentials';
import { HTTPError } from 'ky';

import { oidcApi } from '#src/api/api.js';
import {
  createApplication,
  createApplicationSecret,
  deleteApplication,
} from '#src/api/application.js';
import { getAuditLogs } from '#src/api/index.js';
import { createResource } from '#src/api/resource.js';
import { devFeatureTest, randomString, waitFor } from '#src/utils.js';

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

const [application, resource] = await Promise.all([
  createApplication('application', ApplicationType.MachineToMachine),
  createResource(),
]);

const getLogs = async () =>
  getAuditLogs(
    new URLSearchParams({
      logKey: `${token.Type.ExchangeTokenBy}.${token.ExchangeByType.ClientCredentials}`,
    })
  );

const expectLog = (applicationId: string, secretName: string) =>
  expect.objectContaining({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload: expect.objectContaining({
      applicationId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      applicationSecret: expect.objectContaining({ name: secretName }),
    }),
  });

afterAll(async () => {
  await deleteApplication(application.id).catch(noop);
});

devFeatureTest.describe('client authentication', () => {
  type RequestOptions = {
    authorization?: string;
    body?: Record<string, string>;
    charset?: BufferEncoding;
  };

  const post = async ({ authorization, body, charset }: RequestOptions) => {
    const searchParams = new URLSearchParams({
      grant_type: 'client_credentials',
      ...body,
    });
    return oidcApi
      .post('token', {
        headers: removeUndefinedKeys({
          Authorization: authorization,
          'Content-Type': charset
            ? `application/x-www-form-urlencoded; charset=${charset}`
            : undefined,
        }),
        body: charset ? Buffer.from(searchParams.toString(), charset) : searchParams,
      })
      .json<TokenResponse>();
  };

  const expectError = async (
    options: RequestOptions,
    status: number,
    json?: Record<string, unknown>
  ) => {
    const error = await post(options).catch((error: unknown) => error);
    assert(error instanceof HTTPError);
    expect(error.response.status).toBe(status);

    if (json) {
      expect(await error.response.json()).toMatchObject(json);
    }
  };

  it('should respond with error when no client authentication is provided', async () => {
    await expectError({}, 400, {
      error: 'invalid_request',
      error_description: 'no client authentication mechanism provided',
    });
  });

  it('should respond with error when malformed client authentication is provided', async () => {
    await expectError({ authorization: 'Basic invalid' }, 400, {
      error: 'invalid_request',
      error_description: 'invalid authorization header value format',
    });
  });

  it('should respond with error when client ids do not match', async () => {
    await expectError(
      {
        authorization: `Basic ${Buffer.from(`${application.id}:invalid`).toString('base64')}`,
        body: { client_id: 'invalid' },
      },
      400,
      {
        error: 'invalid_request',
        error_description: 'mismatch in body and authorization client ids',
      }
    );
  });

  it('should respond with error when the client secret is expired', async () => {
    const secret = await createApplicationSecret({
      applicationId: application.id,
      name: randomString(),
      expiresAt: Date.now() + 50,
    });

    await waitFor(50);
    await expectError(
      {
        authorization: `Basic ${Buffer.from(`${application.id}:${secret.value}`).toString(
          'base64'
        )}`,
        body: { resource: resource.indicator },
      },
      400,
      {
        error: 'invalid_request',
        error_description: 'client secret has expired',
      }
    );
  });

  it('should pass when client credentials are valid in authorization header (legacy)', async () => {
    await expect(
      post({
        authorization: `Basic ${Buffer.from(`${application.id}:${application.secret}`).toString(
          'base64'
        )}`,
        body: { resource: resource.indicator },
      })
    ).resolves.toMatchObject({
      token_type: 'Bearer',
    });
  });

  it('should pass when client credentials are valid in body (legacy)', async () => {
    await expect(
      post({
        body: {
          client_id: application.id,
          client_secret: application.secret,
          resource: resource.indicator,
        },
      })
    ).resolves.toMatchObject({
      token_type: 'Bearer',
    });
  });

  it('should pass when client credentials are valid in authorization header', async () => {
    const application = await createApplication('application', ApplicationType.MachineToMachine);
    const secret = await createApplicationSecret({
      applicationId: application.id,
      name: randomString(),
    });
    const beforeLogs = await getLogs();

    expect(beforeLogs).not.toContainEqual(expectLog(application.id, secret.name));
    await expect(
      post({
        authorization: `Basic ${Buffer.from(`${application.id}:${secret.value}`).toString(
          'base64'
        )}`,
        body: { resource: resource.indicator },
      })
    ).resolves.toMatchObject({
      token_type: 'Bearer',
    });

    const logs = await getLogs();
    expect(logs).toContainEqual(expectLog(application.id, secret.name));
    await deleteApplication(application.id);
  });

  it('should pass when client credentials are valid in body', async () => {
    const application = await createApplication('application', ApplicationType.MachineToMachine);
    const secret = await createApplicationSecret({
      applicationId: application.id,
      name: randomString(),
    });
    const beforeLogs = await getLogs();

    expect(beforeLogs).not.toContainEqual(expectLog(application.id, secret.name));
    await expect(
      post({
        body: {
          client_id: application.id,
          client_secret: secret.value,
          resource: resource.indicator,
        },
      })
    ).resolves.toMatchObject({
      token_type: 'Bearer',
    });

    // Set another charset
    for (const charset of ['utf16le', 'latin1'] as const) {
      // eslint-disable-next-line no-await-in-loop
      await expect(
        post({
          body: {
            client_id: application.id,
            client_secret: secret.value,
            resource: resource.indicator,
          },
          charset,
        })
      ).resolves.toMatchObject({
        token_type: 'Bearer',
      });
    }

    const logs = await getLogs();
    expect(logs).toContainEqual(expectLog(application.id, secret.name));
    await deleteApplication(application.id);
  });
});
