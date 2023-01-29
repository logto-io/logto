import { createMockUtils } from '@logto/shared/esm';

const { mockEsmWithActual } = createMockUtils(import.meta.jest);

export const mockId = 'mockId';
export const mockStandardId = async () =>
  mockEsmWithActual('@logto/core-kit', () => ({
    generateStandardId: () => mockId,
  }));
