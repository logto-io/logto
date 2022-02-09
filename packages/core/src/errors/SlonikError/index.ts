import { SlonikError } from 'slonik';

export class DeletionError extends SlonikError {
  table?: string;
  id?: string;

  public constructor(table?: string, id?: string) {
    super('Resource not found.');

    this.table = table;
    this.id = id;
  }
}
