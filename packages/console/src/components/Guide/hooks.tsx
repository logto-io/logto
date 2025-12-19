import { type ReactNode, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { guides } from '@/assets/docs/guides';
import { type Guide } from '@/assets/docs/guides/types';
import { isCloud as isCloudEnv, isDevFeaturesEnabled } from '@/consts/env';
import { thirdPartyApp } from '@/consts/external-links';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import {
  thirdPartyAppCategory,
  type AppGuideCategory,
  type StructuredAppGuideMetadata,
} from '@/types/applications';

const defaultStructuredMetadata: StructuredAppGuideMetadata = {
  featured: [],
  Traditional: [],
  SPA: [],
  Native: [],
  MachineToMachine: [],
  Protected: [],
  SAML: [],
  ThirdParty: [],
};

type FilterOptions = {
  categories?: AppGuideCategory[];
  keyword?: string;
};

export const useApiGuideMetadata = () =>
  guides.filter(({ metadata: { target } }) => target === 'API');

export const useAppGuideMetadata = (): {
  getFilteredAppGuideMetadata: (filters?: FilterOptions) => readonly Guide[];
  getStructuredAppGuideMetadata: (
    filters?: FilterOptions
  ) => Record<AppGuideCategory, readonly Guide[]>;
  getCategoryDescription: (category: AppGuideCategory) => ReactNode;
} => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const appGuides = useMemo(
    () =>
      guides.filter(
        ({ metadata: { target, isCloud, isDevFeature } }) =>
          target !== 'API' && (isCloudEnv || !isCloud) && (isDevFeaturesEnabled || !isDevFeature)
      ),
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
        return appGuides.filter(({ metadata: { target, isFeatured, isThirdParty } }) =>
          filterCategories.some((filterCategory) => {
            return (
              filterCategory === target ||
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              (isFeatured && filterCategory === 'featured') ||
              (isThirdParty && filterCategory === 'ThirdParty')
            );
          })
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
      return [];
    },
    [appGuides]
  );

  const getStructuredAppGuideMetadata = useCallback(
    (filters?: FilterOptions) => {
      const filteredMetadata = getFilteredAppGuideMetadata(filters);

      return filteredMetadata.reduce((accumulated, guide) => {
        const { target, isFeatured, isThirdParty } = guide.metadata;

        // Rule out API target guides to make TypeScript happy
        if (target === 'API') {
          return accumulated;
        }

        if (isThirdParty) {
          return {
            ...accumulated,
            [thirdPartyAppCategory]: [...accumulated[thirdPartyAppCategory], guide],
          };
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

  const categoryDescriptions: Partial<Record<AppGuideCategory, ReactNode>> = useMemo(
    () => ({
      [thirdPartyAppCategory]: (
        <Trans
          components={{
            a: <TextLink targetBlank="noopener" href={getDocumentationUrl(thirdPartyApp)} />,
          }}
        >
          {t('applications.guide.third_party.description')}
        </Trans>
      ),
    }),
    [t]
  );

  const getCategoryDescription = useCallback(
    (category: AppGuideCategory): ReactNode => categoryDescriptions[category] ?? null,
    [categoryDescriptions]
  );

  return { getFilteredAppGuideMetadata, getStructuredAppGuideMetadata, getCategoryDescription };
};
