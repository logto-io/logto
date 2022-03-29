type MarkdownWithYamlFrontmatter<T> = {
  metadata: string;
} & {
  [K in keyof T]?: string;
};

/**
 * A Yaml frontmatter is a series of variables that are defined at the top of the markdown file,
 * that normally is not part of the text contents themselves, such as title, subtitle.
 * Yaml frontmatter both starts and ends with three dashes (---), and valid Yaml syntax can be used
 * in between the three dashes, to define the variables.
 */
export const parseMarkdownWithYamlFrontmatter = <T extends Record<string, string>>(
  markdown: string
): MarkdownWithYamlFrontmatter<T> => {
  const metaRegExp = new RegExp(/^---[\n\r](((?!---).|[\n\r])*)[\n\r]---$/m);

  // "rawYamlHeader" is the full matching string, including the --- and ---
  // "yamlVariables" is the first capturing group, which is the string between the --- and ---
  const [rawYamlHeader, yamlVariables] = metaRegExp.exec(markdown) ?? [];

  if (!rawYamlHeader || !yamlVariables) {
    return { metadata: markdown };
  }

  const keyValues = yamlVariables.split('\n');

  // Converts a list of string like ["key1: value1", "key2: value2"] to { key1: "value1", key2: "value2" }
  const frontmatter = Object.fromEntries<string>(
    keyValues.map((keyValue) => {
      const splitted = keyValue.split(':');
      const [key, value] = splitted;

      return [key ?? keyValue, value?.trim() ?? ''];
    })
  ) as Record<keyof T, string>;

  return { ...frontmatter, metadata: markdown.replace(rawYamlHeader, '').trim() };
};
