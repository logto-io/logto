import semver from 'semver';

export const migrationFileNameRegex = /^(((?!next).)*)\.js$/;

export const getVersionFromFileName = (fileName: string) => {
  const match = migrationFileNameRegex.exec(fileName);

  if (!match?.[1]) {
    throw new Error(`Can not find version name: ${fileName}`);
  }

  return match[1];
};

export const compareVersion = (version1: string, version2: string) => {
  if (semver.eq(version1, version2)) {
    return 0;
  }

  return semver.gt(version1, version2) ? 1 : -1;
};
