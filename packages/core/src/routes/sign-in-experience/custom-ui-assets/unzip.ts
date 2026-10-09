import path from 'node:path';
import { promisify } from 'node:util';
import { inflateRaw } from 'node:zlib';

import { trySafe } from '@silverhand/essentials';
import AdmZip, { type IZipEntry } from 'adm-zip';
import mime from 'mime';
import pMap from 'p-map';

import RequestError from '#src/errors/RequestError/index.js';
import { type UploadFile } from '#src/utils/storage/types.js';

/**
 * The limits the Logto Cloud unzip function enforces, so a zip behaves the same wherever it is
 * uploaded. The zip itself is capped by `maxUploadFileSize` before it gets here.
 */
const maxEntryCount = 200;
const maxEntrySize = 10 * 1024 * 1024; // 10 MB
const uploadConcurrency = 10;

const zipMethodStored = 0;
const zipMethodDeflated = 8;

const inflateRawAsync = promisify(inflateRaw);

/** Metadata such as `__MACOSX/._index.html` or `.DS_Store` is never part of the UI. */
const isHidden = (entryName: string) => entryName.split('/').some((part) => part.startsWith('.'));

/**
 * The single top-level folder every entry sits in, if there is one: zipping a `dist` folder instead
 * of its content is the most common way to build the archive, and the UI should be served from its
 * content either way.
 */
const getRootFolder = (entryNames: string[]) => {
  const folder = entryNames.find((entryName) => !isHidden(entryName))?.split('/')[0];

  if (
    folder &&
    entryNames.every((entryName) => isHidden(entryName) || entryName.startsWith(`${folder}/`))
  ) {
    return folder;
  }
};

/**
 * The path of an entry relative to the asset root, refusing anything that could escape it.
 *
 * @throws {Error} When the entry path is empty, absolute or climbs out with `..`.
 */
const getRelativePath = (entryName: string, rootFolder?: string) => {
  const relativeName =
    rootFolder && entryName.startsWith(`${rootFolder}/`)
      ? entryName.slice(rootFolder.length).replace(/^\/+/, '')
      : entryName;
  const posixName = relativeName.replaceAll('\\', '/');

  if (
    posixName === '' ||
    posixName === '.' ||
    path.posix.isAbsolute(posixName) ||
    posixName.split('/').includes('..')
  ) {
    throw new RequestError('storage.invalid_custom_ui_zip');
  }

  return path.posix.normalize(posixName);
};

const assertEntrySize = (size: number) => {
  if (size >= maxEntrySize) {
    throw new RequestError('storage.custom_ui_file_too_large');
  }
};

/**
 * The content of an entry, never larger than the limit whatever size the header declares.
 *
 * adm-zip only caps the inflate when the declared size is positive, so an entry declaring 0 could
 * inflate without limit. Inflate it ourselves with a hard cap, off the event loop.
 *
 * @throws {Error} When the entry is too large or uses an unsupported compression method.
 */
// eslint-disable-next-line @typescript-eslint/ban-types -- Passed to `UploadFile<Buffer>`, see below
const readEntry = async (entry: IZipEntry): Promise<Buffer> => {
  const { header } = entry;

  try {
    if (header.method === zipMethodStored) {
      // Stored data is copied as is, so it is bounded by the zip size.
      const data = entry.getData();
      assertEntrySize(data.length);
      return data;
    }

    if (header.method !== zipMethodDeflated) {
      throw new RequestError('storage.invalid_custom_ui_zip');
    }

    return await inflateRawAsync(entry.getCompressedData(), { maxOutputLength: maxEntrySize - 1 });
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      throw error;
    }

    // Matched by code: zlib errors may come from another realm (e.g. Jest VM), failing `instanceof`.
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ERR_BUFFER_TOO_LARGE'
    ) {
      throw new RequestError('storage.custom_ui_file_too_large');
    }

    throw new RequestError('storage.invalid_custom_ui_zip');
  }
};

/**
 * Extract the custom UI assets zip and upload every file under `keyPrefix`, which is how the assets
 * are served afterwards. Mirrors the Logto Cloud unzip function, which does the same through an
 * Azure blob trigger.
 *
 * Entry paths and declared sizes are validated before anything is uploaded, so a zip rejected
 * for them leaves nothing behind.
 *
 * @throws {RequestError} When the zip is invalid or breaks a limit. Storage errors pass through.
 */
export const unzipCustomUiAssets = async (
  zip: Uint8Array,
  keyPrefix: string,
  // eslint-disable-next-line @typescript-eslint/ban-types -- Google doesn't allow us to use Uint8Array
  uploadFile: UploadFile<Buffer>
) => {
  const entries = trySafe(() => new AdmZip(Buffer.from(zip)).getEntries());

  if (!entries?.length) {
    throw new RequestError('storage.invalid_custom_ui_zip');
  }

  if (entries.length > maxEntryCount) {
    throw new RequestError('storage.custom_ui_too_many_entries');
  }

  const rootFolder = getRootFolder(entries.map(({ entryName }) => entryName));

  const files = entries
    // Folders exist implicitly through the keys of the files in them.
    .filter(({ isDirectory }) => !isDirectory)
    .map((entry) => ({
      entry,
      // Validated before hidden entries are skipped, so a `..` segment is refused rather than
      // silently dropped as hidden.
      objectKey: path.posix.join(keyPrefix, getRelativePath(entry.entryName, rootFolder)),
    }))
    .filter(({ entry }) => !isHidden(entry.entryName));

  for (const { entry } of files) {
    // A quick rejection on the declared size; the real size is enforced when inflating.
    assertEntrySize(entry.header.size);
  }

  await pMap(
    files,
    async ({ entry, objectKey }) => {
      const data = await readEntry(entry);

      await uploadFile(data, objectKey, {
        contentType: mime.getType(entry.entryName) ?? 'application/octet-stream',
        // The assets are served through Logto, never straight from the bucket.
        isPublic: false,
      });
    },
    { concurrency: uploadConcurrency }
  );
};
