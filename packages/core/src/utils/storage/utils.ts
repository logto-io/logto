export const fileNameUrlEncoder = (url: string): string => {
  const splitter = url.split('/');
  const filename = splitter.at(-1);
  return filename ? [...splitter.slice(0, -1), encodeURIComponent(filename)].join('/') : url;
};
