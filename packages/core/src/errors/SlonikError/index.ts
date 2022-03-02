import { SchemaLike, GeneratedSchema } from '@logto/schemas';
import { SlonikError } from 'slonik';

import { UpdateWhereData } from '@/database/types';
import { OmitAutoSetFields } from '@/database/utils';

export class DeletionError extends SlonikError {
  table?: string;
  id?: string;

  public constructor(table?: string, id?: string) {
    super('Resource not found.');

    this.table = table;
    this.id = id;
  }
}

export class UpdateError<Schema extends SchemaLike> extends SlonikError {
  schema: GeneratedSchema<Schema>;
  detail: UpdateWhereData<Schema>;

  public constructor(schema: GeneratedSchema<Schema>, detail: UpdateWhereData<Schema>) {
    super('Resource not found.');

    this.schema = schema;
    this.detail = detail;
  }
}

export class InsertionError<Schema extends SchemaLike> extends SlonikError {
  schema: GeneratedSchema<Schema>;
  detail?: OmitAutoSetFields<Schema>;

  public constructor(schema: GeneratedSchema<Schema>, detail?: OmitAutoSetFields<Schema>) {
    super('Create Error.');

    this.schema = schema;
    this.detail = detail;
  }
}
