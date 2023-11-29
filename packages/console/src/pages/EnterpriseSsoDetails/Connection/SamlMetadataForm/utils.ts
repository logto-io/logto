// In Bytes.
export const calculateFileSize = (
  xmlContent: string,
  fileName: string,
  mimeType: string
): number => {
  const blob = new Blob([xmlContent], { type: mimeType });
  const file = new File([blob], fileName);
  return file.size;
};
