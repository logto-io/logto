import kebabCase from 'just-kebab-case';

export const getPath = (title: string): string => `/${kebabCase(title)}`;
