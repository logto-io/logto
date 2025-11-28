import { TenantIdConfig } from '@logto/schemas';
import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import createTenantIdConfigQueries from './tenant-id-config.js';

const { jest } = import.meta;

const mockTenantId = 'test_tenant';

const mockTenantIdConfig = {
  tenantId: mockTenantId,
  idFormat: 'nanoid',
  createdAt: new Date('2024-01-01').getTime(),
  updatedAt: new Date('2024-01-01').getTime(),
};

describe('createTenantIdConfigQueries', () => {
  const pool = createMockPool({
    query: jest.fn(),
  });

  const queries = createTenantIdConfigQueries(pool);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findTenantIdConfigByTenantId', () => {
    it('should find tenant ID config by tenant ID', async () => {
      const mockQuery = pool.query as jest.Mock;
      mockQuery.mockResolvedValueOnce(createMockQueryResult([mockTenantIdConfig]));

      const result = await queries.findTenantIdConfigByTenantId(mockTenantId);

      expect(result).toEqual(mockTenantIdConfig);
      expect(mockQuery).toHaveBeenCalledTimes(1);

      // Verify the SQL query contains the correct table and tenant ID
      const sqlCall = mockQuery.mock.calls[0][0];
      expect(sqlCall.sql).toContain(TenantIdConfig.table);
      expect(sqlCall.sql).toContain('tenant_id');
    });

    it('should return null when tenant ID config does not exist', async () => {
      const mockQuery = pool.query as jest.Mock;
      mockQuery.mockResolvedValueOnce(createMockQueryResult([]));

      const result = await queries.findTenantIdConfigByTenantId('non_existent_tenant');

      expect(result).toBeNull();
    });
  });

  describe('insertTenantIdConfig', () => {
    it('should insert tenant ID config', async () => {
      const mockQuery = pool.query as jest.Mock;
      mockQuery.mockResolvedValueOnce(createMockQueryResult([mockTenantIdConfig]));

      const newConfig = {
        tenantId: 'new_tenant',
        idFormat: 'uuid',
      };

      const result = await queries.insertTenantIdConfig(newConfig);

      expect(result).toEqual(mockTenantIdConfig);
      expect(mockQuery).toHaveBeenCalledTimes(1);

      // Verify the SQL query is an INSERT
      const sqlCall = mockQuery.mock.calls[0][0];
      expect(sqlCall.sql).toContain('insert into');
      expect(sqlCall.sql).toContain(TenantIdConfig.table);
    });
  });

  describe('updateTenantIdConfig', () => {
    it('should update tenant ID config', async () => {
      const mockQuery = pool.query as jest.Mock;
      const updatedConfig = {
        ...mockTenantIdConfig,
        idFormat: 'uuid',
        updatedAt: new Date('2024-01-02').getTime(),
      };
      mockQuery.mockResolvedValueOnce(createMockQueryResult([updatedConfig]));

      const result = await queries.updateTenantIdConfig(mockTenantId, {
        idFormat: 'uuid',
      });

      expect(result).toEqual(updatedConfig);
      expect(mockQuery).toHaveBeenCalledTimes(1);

      // Verify the SQL query is an UPDATE
      const sqlCall = mockQuery.mock.calls[0][0];
      expect(sqlCall.sql).toContain('update');
      expect(sqlCall.sql).toContain(TenantIdConfig.table);
      expect(sqlCall.sql).toContain('tenant_id');
    });
  });
});
