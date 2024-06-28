import { type Entry } from 'unzipper';

/**
 * Remove zip file root directory from context path.
 * E.g. If zip file is 'archive.zip', the entry path should be 'archive/index.html' by default.
 * We need to remove 'archive/' from the path, since it is not needed in most cases.
 */
export const removeZipRootDirectory = (entryPath: string) =>
  entryPath.split('/').slice(1).join('/');

/**
 * Check if the given entry object is a directory or system file.
 * System files are files that are not needed in our processing logic.
 * E.g. __MACOSX, .DS_Store, .thumbs.db
 * @param entry - Entry object from unzipper
 * @returns boolean
 */
export const checkEntryForDirectoryOrSystemFile = (entry: Entry) => {
  return (
    entry.type === 'Directory' ||
    entry.path.startsWith('__MACOSX/') ||
    entry.path.endsWith('/.DS_Store') ||
    entry.path.endsWith('/.thumbs.db')
  );
};
