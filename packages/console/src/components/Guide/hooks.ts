import { useCallback, useMemo } from 'react';

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

export const useAppGuideMetadata = (): {
  getFilteredAppGuideMetadata: (filters?: FilterOptions) => readonly Guide[] | undefined;
  getStructuredAppGuideMetadata: (
    filters?: FilterOptions
  ) => Record<AppGuideCategory, readonly Guide[]>;
} => {
  const appGuides = useMemo(
    () => guides.filter(({ metadata: { target } }) => target !== 'API'),
    []
  );

  const getFilteredAppGuideMetadata = useCallback(
    (filters?: FilterOptions) => {
      const { categories: filterCategories, keyword } = filters ?? {};
      // If no filter is applied, return all metadata
      if (!filterCategories?.length && !keyword) {
        return appGuides;
      }

      // Keyword only, return partial name matched result
      if (keyword && !filterCategories?.length) {
        return appGuides.filter(({ metadata: { name } }) =>
          name.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      // Categories only, return selected categories
      if (!keyword && filterCategories?.length) {
        return appGuides.filter(({ metadata: { target, isFeatured } }) =>
          filterCategories.some(
            (filterCategory) =>
              filterCategory === target || (isFeatured && filterCategory === 'featured')
          )
        );
      }

      // Keyword and categories, return partial name matched result in selected categories
      if (keyword && filterCategories?.length) {
        return appGuides.filter(
          ({ metadata: { name, target, isFeatured } }) =>
            name.toLowerCase().includes(keyword.toLowerCase()) &&
            filterCategories.some(
              (filterCategory) =>
                filterCategory === target || (isFeatured && filterCategory === 'featured')
            )
        );
      }
    },
    [appGuides]
  );

  const getStructuredAppGuideMetadata = useCallback(
    (filters?: FilterOptions) => {
      const filteredMetadata = getFilteredAppGuideMetadata(filters) ?? [];
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
    [getFilteredAppGuideMetadata]
  );

  return { getFilteredAppGuideMetadata, getStructuredAppGuideMetadata };
};
