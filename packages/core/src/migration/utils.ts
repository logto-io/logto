export const migrationFileNameRegex = /-(\d{10,11})-?.*\.js$/;

export const getTimestampFromFileName = (fileName: string) => {
  const match = migrationFileNameRegex.exec(fileName);

  if (!match?.[1]) {
    throw new Error(`Can not get timestamp: ${fileName}`);
  }

  return Number(match[1]);
};
