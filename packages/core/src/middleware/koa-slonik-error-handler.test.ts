import { Users } from '@logto/schemas';
import { NotFoundError, SlonikError } from 'slonik';

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
});
