export const alterationFileNameRegex = /-(\d{10,11})-?.*\.js$/;

export const getTimestampFromFileName = (fileName: string) => {
  const match = alterationFileNameRegex.exec(fileName);

  if (!match?.[1]) {
    throw new Error(`Can not get timestamp: ${fileName}`);
  }

  return Number(match[1]);
};
