// In Bytes.
export const getXmlFileSize = (xmlContent: string): number => {
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const file = new File([blob], 'identity provider metadata.xml');
  return file.size;
};
