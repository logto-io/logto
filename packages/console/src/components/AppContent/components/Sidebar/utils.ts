import kebabCase from 'lodash.kebabcase';

export const getPath = (title: string): string => `/${kebabCase(title)}`;
