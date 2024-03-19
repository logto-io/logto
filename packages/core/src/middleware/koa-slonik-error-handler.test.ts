import { Users } from '@logto/schemas';
import {
  NotFoundError,
  SlonikError,
  UniqueIntegrityConstraintViolationError,
} from '@silverhand/slonik';

import RequestError from '#src/errors/RequestError/index.js';
import { DeletionError, InsertionError, UpdateError } from '#src/errors/SlonikError/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaSlonikErrorHandler from './koa-slonik-error-handler.js';

const { jest } = import.meta;

describe('koaSlonikErrorHandler middleware', () => {
  const next = jest.fn();
  const ctx = createContextWithRouteParameters();

  it('should throw no errors if no errors are caught', async () => {
    await expect(koaSlonikErrorHandler()(ctx, next)).resolves.not.toThrow();
  });

  it('should throw original error if error type are not Slonik', async () => {
    const error = new Error('foo');

    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaSlonikErrorHandler()(ctx, next)).rejects.toMatchError(error);
  });

  it('should throw original error if not intend to handled', async () => {
    const error = new SlonikError();

    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaSlonikErrorHandler()(ctx, next)).rejects.toMatchError(error);
  });

  it('Insertion Error', async () => {
    const error = new InsertionError(Users, { id: '123', applicationId: 'bar' });
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaSlonikErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError({
        code: 'entity.create_failed',
        status: 422,
        name: Users.tableSingular,
      })
    );
  });

  it('Update Error', async () => {
    const error = new UpdateError(Users, {
      set: { name: 'punk' },
      where: { id: '123' },
      jsonbMode: 'merge',
    });
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaSlonikErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError({
        code: 'entity.not_exists',
        status: 404,
        name: Users.tableSingular,
      })
    );
  });

  it('Deletion Error', async () => {
    const error = new DeletionError();
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaSlonikErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError({
        code: 'entity.not_found',
        status: 404,
      })
    );
  });

  it('NotFoundError', async () => {
    const error = new NotFoundError();
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaSlonikErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError({
        code: 'entity.not_found',
        status: 404,
      })
    );
  });

  it('UniqueIntegrityConstraintViolationError for protected application host', async () => {
    const error = new UniqueIntegrityConstraintViolationError(
      new Error(' '),
      'applications__protected_app_metadata_host'
    );
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaSlonikErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError({
        code: 'application.protected_application_subdomain_exists',
        status: 422,
      })
    );
  });

  it('UniqueIntegrityConstraintViolationError for protected application custom domain', async () => {
    const error = new UniqueIntegrityConstraintViolationError(
      new Error(' '),
      'applications__protected_app_metadata_custom_domain'
    );
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaSlonikErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError({
        code: 'domain.hostname_already_exists',
        status: 422,
      })
    );
  });
});
