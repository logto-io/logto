/**
 * Generate Content-Disposition header value for file download
 * @param filename The name of the file to be downloaded
 * @returns Content-Disposition header value
 */
export const createContentDisposition = (filename: string) => {
  // RFC 6266 requires the filename to be quoted and UTF-8 encoded
  const encodedFilename = encodeURIComponent(filename);
  return `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`;
};
