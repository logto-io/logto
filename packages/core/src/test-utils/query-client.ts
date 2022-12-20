import type { PostgreSql } from '@withtyped/postgres';
import { QueryClient } from '@withtyped/server';

// Consider move to withtyped if everything goes well
export class MockQueryClient extends QueryClient<PostgreSql> {
  async connect() {
    console.debug('MockQueryClient connect');
  }

  async end() {
    console.debug('MockQueryClient end');
  }

  async query() {
    console.debug('MockQueryClient query');

    return { rows: [], rowCount: 0 };
  }
}
