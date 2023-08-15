import { useCallback } from 'react';

import guides from '@/assets/docs/guides';
import { type Guide } from '@/assets/docs/guides/types';
import { type AppGuideCategory, type StructuredAppGuideMetadata } from '@/types/applications';

const defaultStructuredMetadata: StructuredAppGuideMetadata = {
  featured: [],
  Traditional: [],
  SPA: [],
  Native: [],
  MachineToMachine: [],
};

type FilterOptions = {
  categories?: AppGuideCategory[];
  keyword?: string;
};

const useAppGuideMetadata = (): [
  (filters?: FilterOptions) => readonly Guide[] | undefined,
  (filters?: FilterOptions) => Record<AppGuideCategory, readonly Guide[]>,
] => {
  const getFilteredMetadata = useCallback((filters?: FilterOptions) => {
    const { categories: filterCategories, keyword } = filters ?? {};
    // If no filter is applied, return all metadata
    if (!filterCategories?.length && !keyword) {
      return guides;
    }

    // Keyword only, return partial name matched result
    if (keyword && !filterCategories?.length) {
      return guides.filter(({ metadata: { name } }) =>
        name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // Categories only, return selected categories
    if (!keyword && filterCategories?.length) {
      return guides.filter(({ metadata: { target, isFeatured } }) =>
        filterCategories.some(
          (filterCategory) =>
            filterCategory === target || (isFeatured && filterCategory === 'featured')
        )
      );
    }

    // Keyword and categories, return partial name matched result in selected categories
    if (keyword && filterCategories?.length) {
      return guides.filter(
        ({ metadata: { name, target, isFeatured } }) =>
          name.toLowerCase().includes(keyword.toLowerCase()) &&
          filterCategories.some(
            (filterCategory) =>
              filterCategory === target || (isFeatured && filterCategory === 'featured')
          )
      );
    }
  }, []);

  const getStructuredMetadata = useCallback(
    (filters?: FilterOptions) => {
      const filteredMetadata = getFilteredMetadata(filters) ?? [];
      return filteredMetadata.reduce((accumulated, guide) => {
        const { target, isFeatured } = guide.metadata;

        // Rule out API target guides to make TypeScript happy
        if (target === 'API') {
          return accumulated;
        }
        return {
          ...accumulated,
          [target]: [...accumulated[target], guide],
          ...(isFeatured && {
            featured: [...accumulated.featured, guide],
          }),
        };
      }, defaultStructuredMetadata);
    },
    [getFilteredMetadata]
  );

  return [getFilteredMetadata, getStructuredMetadata];
};

export default useAppGuideMetadata;
