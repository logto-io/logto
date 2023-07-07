import type { SchemaLike, GeneratedSchema } from '@logto/schemas';
import type { OmitAutoSetFields, UpdateWhereData } from '@logto/shared';
import { SlonikError } from 'slonik';

export class DeletionError extends SlonikError {
  public constructor(
    public readonly table?: string,
    public readonly id?: string
  ) {
    super('Resource not found.');
  }
}

export class UpdateError<
  CreateSchema extends SchemaLike,
  Schema extends CreateSchema,
> extends SlonikError {
  public constructor(
    public readonly schema: GeneratedSchema<CreateSchema, Schema>,
    public readonly detail: Partial<UpdateWhereData<Schema>>
  ) {
    super('Resource not found.');
  }
}

export class InsertionError<
  CreateSchema extends SchemaLike,
  Schema extends CreateSchema,
> extends SlonikError {
  public constructor(
    public readonly schema: GeneratedSchema<CreateSchema, Schema>,
    public readonly detail?: OmitAutoSetFields<CreateSchema>
  ) {
    super('Create Error.');
  }
}
