import { SlonikError } from 'slonik';

export class DeletionError extends SlonikError {
  public constructor() {
    super('Resource not found.');
  }
}
