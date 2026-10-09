import AdmZip from 'adm-zip';

import { unzipCustomUiAssets } from './unzip.js';

const { jest } = import.meta;

const buildZip = (entries: Record<string, string>) => {
  const zip = new AdmZip();

  for (const [name, content] of Object.entries(entries)) {
    zip.addFile(name, Buffer.from(content));
  }

  return zip.toBuffer();
};

const uploadFile = jest.fn(async () => ({ url: 'https://fake.url' }));

const getUploadedKeys = () =>
  uploadFile.mock.calls
    .map((call: unknown[]) => String(call[1]))
    .slice()
    .sort((left, right) => left.localeCompare(right));

describe('unzipCustomUiAssets()', () => {
  afterEach(() => {
    uploadFile.mockClear();
  });

  it('should upload every file under the key prefix with its content type', async () => {
    await unzipCustomUiAssets(
      buildZip({ 'index.html': '<html></html>', 'assets/index.js': '', 'assets/logo': '' }),
      'tenant/asset',
      uploadFile
    );

    expect(getUploadedKeys()).toEqual([
      'tenant/asset/assets/index.js',
      'tenant/asset/assets/logo',
      'tenant/asset/index.html',
    ]);
    expect(uploadFile).toHaveBeenCalledWith(
      Buffer.from('<html></html>'),
      'tenant/asset/index.html',
      {
        contentType: 'text/html',
        isPublic: false,
      }
    );
    expect(uploadFile).toHaveBeenCalledWith(expect.anything(), 'tenant/asset/assets/index.js', {
      contentType: 'text/javascript',
      isPublic: false,
    });
    expect(uploadFile).toHaveBeenCalledWith(expect.anything(), 'tenant/asset/assets/logo', {
      contentType: 'application/octet-stream',
      isPublic: false,
    });
  });

  it('should strip a single root folder and skip hidden files', async () => {
    await unzipCustomUiAssets(
      buildZip({
        'dist/index.html': '',
        'dist/assets/index.js': '',
        'dist/.DS_Store': '',
        '__MACOSX/._index.html': '',
      }),
      'tenant/asset',
      uploadFile
    );

    expect(getUploadedKeys()).toEqual(['tenant/asset/assets/index.js', 'tenant/asset/index.html']);
  });

  it.each<Record<string, string>>([
    { 'app.js': '' },
    { 'index.html/': '', 'app.js': '' },
    { '.hidden/index.html': '', 'app.js': '' },
    { 'Index.html': '', 'app.js': '' },
    { 'dist/nested/index.html': '', 'dist/app.js': '' },
    { 'dist/index.html': '', 'README.txt': '' },
  ])('should reject a zip without an asset-root index.html: %j', async (entries) => {
    await expect(
      unzipCustomUiAssets(buildZip(entries), 'tenant/asset', uploadFile)
    ).rejects.toMatchObject({ code: 'request.invalid_input', status: 400 });
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it.each([
    new AdmZip().toBuffer(),
    Buffer.from('not-a-zip'),
    buildZip({ 'index.html': '' }).subarray(0, 20),
  ])('should reject an unreadable or empty zip', async (buffer) => {
    await expect(unzipCustomUiAssets(buffer, 'prefix', uploadFile)).rejects.toMatchObject({
      status: 400,
      code: 'storage.invalid_custom_ui_zip',
    });
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('should reject a zip with too many entries', async () => {
    const entries = Object.fromEntries(
      Array.from({ length: 201 }, (_, index) => [`${index}.txt`, ''])
    );

    await expect(
      unzipCustomUiAssets(buildZip(entries), 'prefix', uploadFile)
    ).rejects.toMatchObject({
      status: 400,
      code: 'storage.custom_ui_too_many_entries',
    });
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('should accept 200 entries and a file one byte below 10 MiB', async () => {
    const entries = Object.fromEntries(
      Array.from({ length: 199 }, (_, index) => [`${index}.txt`, ''])
    );
    await unzipCustomUiAssets(
      buildZip({ ...entries, 'index.html': 'a'.repeat(10 * 1024 * 1024 - 1) }),
      'prefix',
      uploadFile
    );
    expect(getUploadedKeys()).toHaveLength(200);
    expect(uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({ length: 10 * 1024 * 1024 - 1 }),
      'prefix/index.html',
      { contentType: 'text/html', isPublic: false }
    );
  });

  it.each([10 * 1024 * 1024, 10 * 1024 * 1024 + 1])(
    'should reject a file of %i bytes',
    async (size) => {
      const zip = new AdmZip();
      zip.addFile('index.html', Buffer.from(''));
      zip.addFile('large.bin', Buffer.alloc(size));

      await expect(unzipCustomUiAssets(zip.toBuffer(), 'prefix', uploadFile)).rejects.toMatchObject(
        {
          status: 400,
          code: 'storage.custom_ui_file_too_large',
        }
      );
      expect(uploadFile).not.toHaveBeenCalled();
    }
  );

  it('should reject a file of 10 MB or more that declares a size of 0', async () => {
    const zip = new AdmZip();
    zip.addFile('a-large.bin', Buffer.alloc(10 * 1024 * 1024));
    zip.addFile('index.html', Buffer.from(''));
    const buffer = zip.toBuffer();

    // A-large.bin sorts first. Patch its declared size in both headers to bypass the size check.
    for (const [signature, sizeOffset] of [
      ['PK\u0003\u0004', 22],
      ['PK\u0001\u0002', 24],
    ] as const) {
      const headerOffset = buffer.indexOf(signature, 0, 'latin1');
      buffer.writeUInt32LE(0, headerOffset + sizeOffset);
    }

    await expect(unzipCustomUiAssets(buffer, 'prefix', uploadFile)).rejects.toMatchObject({
      status: 400,
      code: 'storage.custom_ui_file_too_large',
    });
    // Other files may upload concurrently, but the oversized entry must never reach storage.
    expect(uploadFile).not.toHaveBeenCalledWith(
      expect.anything(),
      'prefix/a-large.bin',
      expect.anything()
    );
  });

  it.each(['../evil.txt', 'root/../evil.txt', 'root\\..\\evil.txt'])(
    'should reject the entry path `%s` before uploading anything',
    async (entryName) => {
      const zip = new AdmZip();
      zip.addFile('index.html', Buffer.from(''));
      zip.addFile('placeholder', Buffer.from(''));
      // `addFile` sanitizes the name, so set the raw header name the way a crafted zip carries it.
      const [, crafted] = zip.getEntries();
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Craft a malicious entry name.
      crafted!.entryName = entryName;

      await expect(unzipCustomUiAssets(zip.toBuffer(), 'prefix', uploadFile)).rejects.toMatchObject(
        {
          status: 400,
          code: 'storage.invalid_custom_ui_zip',
        }
      );
      expect(uploadFile).not.toHaveBeenCalled();
    }
  );
});
