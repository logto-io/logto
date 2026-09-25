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

  it('should reject an empty zip', async () => {
    await expect(
      unzipCustomUiAssets(new AdmZip().toBuffer(), 'prefix', uploadFile)
    ).rejects.toThrow('Zip file is empty');
  });

  it('should reject a zip with too many entries', async () => {
    const entries = Object.fromEntries(
      Array.from({ length: 201 }, (_, index) => [`${index}.txt`, ''])
    );

    await expect(unzipCustomUiAssets(buildZip(entries), 'prefix', uploadFile)).rejects.toThrow(
      'Zip file contains too many entries'
    );
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('should reject a file of 10 MB or more', async () => {
    const zip = new AdmZip();
    zip.addFile('index.html', Buffer.from(''));
    zip.addFile('large.bin', Buffer.alloc(10 * 1024 * 1024));

    await expect(unzipCustomUiAssets(zip.toBuffer(), 'prefix', uploadFile)).rejects.toThrow(
      'File large.bin is too large'
    );
    expect(uploadFile).not.toHaveBeenCalled();
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

      await expect(unzipCustomUiAssets(zip.toBuffer(), 'prefix', uploadFile)).rejects.toThrow(
        'Invalid zip entry path'
      );
      expect(uploadFile).not.toHaveBeenCalled();
    }
  );
});
