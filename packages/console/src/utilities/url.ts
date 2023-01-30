export const buildUrl = (path: string, searchParameters: Record<string, string>) =>
  `${path}?${new URLSearchParams(searchParameters).toString()}`;

export const formatSearchKeyword = (keyword: string) => `%${keyword}%`;
