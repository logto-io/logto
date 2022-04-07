import i18next from 'i18next';
import { useMemo } from 'react';
// eslint-disable-next-line node/file-extension-in-import
import useSWRImmutable from 'swr/immutable';

import { StepMetadata } from '@/types/get-started';
import { parseMarkdownWithYamlFrontmatter } from '@/utilities/markdown';

type DocumentFileNames = {
  files: string[];
};

export type GetStartedType = 'application' | 'connector';

/**
 * Fetch the markdown files for the given type and subtype.
 * @param type 'application' or 'connector'
 * @param subtype Application library name or connector name
 * @returns List of step metadata including Yaml frontmatter and markdown content
 */
export const useGetStartedSteps = (type: GetStartedType, subtype?: string) => {
  const subPath = subtype ? `/${subtype}` : '';
  const publicPath = useMemo(
    () => `/console/get-started/${type}${subPath}/${i18next.language}`.toLowerCase(),
    [type, subPath]
  );

  const { data: jsonData } = useSWRImmutable<DocumentFileNames>(`${publicPath}/index.json`);
  const { data: steps } = useSWRImmutable<StepMetadata[]>(
    jsonData,
    async ({ files }: DocumentFileNames) =>
      Promise.all(
        files.map(async (fileName) => {
          const response = await fetch(`${publicPath}/${fileName}`);
          const markdownFile = await response.text();

          return parseMarkdownWithYamlFrontmatter<StepMetadata>(markdownFile);
        })
      )
  );

  return steps;
};
