import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import RequestError from '#src/errors/RequestError/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaConnectorErrorHandler from './koa-connector-error-handler.js';

const { jest } = import.meta;

describe('koaConnectorErrorHandler middleware', () => {
  const next = jest.fn();
  const ctx = createContextWithRouteParameters();

  it('should throw no errors if no errors are caught', async () => {
    await expect(koaConnectorErrorHandler()(ctx, next)).resolves.not.toThrow();
  });

  it('should throw original error if error type is not ConnectorError', async () => {
    const error = new Error('err');

    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(error);
  });

  it('Invalid Request Parameters', async () => {
    const message = 'Mock Invalid Request Parameters';
    const error = new ConnectorError(ConnectorErrorCodes.InvalidRequestParameters, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.invalid_request_parameters',
          status: 400,
        },
        { message }
      )
    );
  });

  it('Insufficient Request Parameters', async () => {
    const message = 'Mock Insufficient Request Parameters';
    const error = new ConnectorError(ConnectorErrorCodes.InsufficientRequestParameters, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.insufficient_request_parameters',
          status: 400,
        },
        { message }
      )
    );
  });

  it('Invalid Config', async () => {
    const message = 'Mock Invalid Config';
    const error = new ConnectorError(ConnectorErrorCodes.InvalidConfig, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.invalid_config',
          status: 400,
        },
        { message }
      )
    );
  });

  it('Invalid Response', async () => {
    const message = 'Mock Invalid Response';
    const error = new ConnectorError(ConnectorErrorCodes.InvalidResponse, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.invalid_response',
          status: 400,
        },
        { message }
      )
    );
  });

  it('Template Not Found', async () => {
    const message = 'Mock Template Not Found';
    const error = new ConnectorError(ConnectorErrorCodes.TemplateNotFound, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.template_not_found',
          status: 400,
        },
        { message }
      )
    );
  });

  it('Social Auth Code Invalid', async () => {
    const message = 'Mock Social Auth Code Invalid';
    const error = new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.social_auth_code_invalid',
          status: 401,
        },
        { message }
      )
    );
  });

  it('Social Access Token Invalid', async () => {
    const message = 'Mock Social Access Token Invalid';
    const error = new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.social_invalid_access_token',
          status: 401,
        },
        { message }
      )
    );
  });

  it('Social Id Token Invalid', async () => {
    const message = 'Mock Social Id Token Invalid';
    const error = new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.social_invalid_id_token',
          status: 401,
        },
        { message }
      )
    );
  });

  it('Authorization Failed', async () => {
    const message = 'Mock Authorization Failed';
    const error = new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.authorization_failed',
          status: 401,
        },
        { message }
      )
    );
  });

  it('General connector errors with string type messages', async () => {
    const message = 'Mock General connector errors';
    const error = new ConnectorError(ConnectorErrorCodes.General, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.general',
          status: 400,
        },
        { message }
      )
    );
  });

  it('General connector errors with message objects', async () => {
    const message = { errorCode: 400, errorDescription: 'Mock General connector errors' };
    const error = new ConnectorError(ConnectorErrorCodes.General, message);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaConnectorErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'connector.general',
          status: 400,
          errorDescription: '\nMock General connector errors',
        },
        message
      )
    );
  });
});
