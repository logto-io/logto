import { type IdFormat } from '@logto/shared';

import { MockQueries } from '#src/test-utils/tenant.js';

import { createIdFormatLibrary } from './id-format.js';

const { jest } = import.meta;

const mockTenantId = 'test_tenant';

const mockTenantIdConfig = {
  tenantId: mockTenantId,
  idFormat: 'nanoid' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('createIdFormatLibrary', () => {
  const findTenantIdConfigByTenantId = jest.fn();

  const queries = new MockQueries({
    tenantIdConfig: {
      findTenantIdConfigByTenantId,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTenantIdConfig', () => {
    it('should return config from database', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce(mockTenantIdConfig);

      const library = createIdFormatLibrary(mockTenantId, queries);
      const config = await library.getTenantIdConfig();

      expect(config).toEqual(mockTenantIdConfig);
      expect(findTenantIdConfigByTenantId).toHaveBeenCalledWith(mockTenantId);
    });

    it('should return default config when database config does not exist', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce(null);

      const library = createIdFormatLibrary(mockTenantId, queries);
      const config = await library.getTenantIdConfig();

      expect(config.tenantId).toBe(mockTenantId);
      expect(config.idFormat).toBe('nanoid');
    });

    it('should cache config after first retrieval', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce(mockTenantIdConfig);

      const library = createIdFormatLibrary(mockTenantId, queries);

      // First call
      await library.getTenantIdConfig();
      // Second call
      await library.getTenantIdConfig();

      // Should only query database once
      expect(findTenantIdConfigByTenantId).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after clearCache is called', async () => {
      findTenantIdConfigByTenantId.mockResolvedValue(mockTenantIdConfig);

      const library = createIdFormatLibrary(mockTenantId, queries);

      // First call
      await library.getTenantIdConfig();

      // Clear cache
      library.clearCache();

      // Second call after cache clear
      await library.getTenantIdConfig();

      // Should query database twice
      expect(findTenantIdConfigByTenantId).toHaveBeenCalledTimes(2);
    });
  });

  describe('getIdFormat', () => {
    it('should return ID format from config', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce(mockTenantIdConfig);

      const library = createIdFormatLibrary(mockTenantId, queries);
      const format = await library.getIdFormat();

      expect(format).toBe('nanoid');
    });

    it('should return uuid when config has uuid format', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce({
        ...mockTenantIdConfig,
        idFormat: 'uuid',
      });

      const library = createIdFormatLibrary(mockTenantId, queries);
      const format = await library.getIdFormat();

      expect(format).toBe('uuid');
    });
  });

  describe('generateUserId', () => {
    it('should generate nanoid when format is nanoid', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce({
        ...mockTenantIdConfig,
        idFormat: 'nanoid',
      });

      const library = createIdFormatLibrary(mockTenantId, queries);
      const id = await library.generateUserId();

      // Nanoid user IDs are 12 characters, lowercase alphanumeric
      expect(id).toMatch(/^[0-9a-z]{12}$/);
    });

    it('should generate UUID when format is uuid', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce({
        ...mockTenantIdConfig,
        idFormat: 'uuid',
      });

      const library = createIdFormatLibrary(mockTenantId, queries);
      const id = await library.generateUserId();

      // UUID v4 format
      expect(id).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
    });
  });

  describe('generateOrganizationId', () => {
    it('should generate nanoid when format is nanoid', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce({
        ...mockTenantIdConfig,
        idFormat: 'nanoid',
      });

      const library = createIdFormatLibrary(mockTenantId, queries);
      const id = await library.generateOrganizationId();

      // Nanoid organization IDs are 21 characters, lowercase alphanumeric
      expect(id).toMatch(/^[0-9a-z]{21}$/);
    });

    it('should generate UUID when format is uuid', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce({
        ...mockTenantIdConfig,
        idFormat: 'uuid',
      });

      const library = createIdFormatLibrary(mockTenantId, queries);
      const id = await library.generateOrganizationId();

      // UUID v4 format
      expect(id).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
    });
  });

  describe('generateRoleId', () => {
    it('should generate nanoid when format is nanoid', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce({
        ...mockTenantIdConfig,
        idFormat: 'nanoid',
      });

      const library = createIdFormatLibrary(mockTenantId, queries);
      const id = await library.generateRoleId();

      // Nanoid role IDs are 21 characters, lowercase alphanumeric
      expect(id).toMatch(/^[0-9a-z]{21}$/);
    });

    it('should generate UUID when format is uuid', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce({
        ...mockTenantIdConfig,
        idFormat: 'uuid',
      });

      const library = createIdFormatLibrary(mockTenantId, queries);
      const id = await library.generateRoleId();

      // UUID v4 format
      expect(id).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
    });
  });

  describe('generateOrganizationRoleId', () => {
    it('should generate nanoid when format is nanoid', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce({
        ...mockTenantIdConfig,
        idFormat: 'nanoid',
      });

      const library = createIdFormatLibrary(mockTenantId, queries);
      const id = await library.generateOrganizationRoleId();

      // Nanoid organization role IDs are 21 characters, lowercase alphanumeric
      expect(id).toMatch(/^[0-9a-z]{21}$/);
    });

    it('should generate UUID when format is uuid', async () => {
      findTenantIdConfigByTenantId.mockResolvedValueOnce({
        ...mockTenantIdConfig,
        idFormat: 'uuid',
      });

      const library = createIdFormatLibrary(mockTenantId, queries);
      const id = await library.generateOrganizationRoleId();

      // UUID v4 format
      expect(id).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
    });
  });

  describe('ID uniqueness', () => {
    it('should generate unique IDs', async () => {
      findTenantIdConfigByTenantId.mockResolvedValue(mockTenantIdConfig);

      const library = createIdFormatLibrary(mockTenantId, queries);

      // Generate multiple IDs
      const ids = await Promise.all([
        library.generateUserId(),
        library.generateUserId(),
        library.generateUserId(),
        library.generateOrganizationId(),
        library.generateOrganizationId(),
        library.generateRoleId(),
        library.generateRoleId(),
      ]);

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
