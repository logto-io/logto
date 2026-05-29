import { getAvatarUploadErrorMessage, validateAvatarFile } from './avatar-upload';

describe('validateAvatarFile', () => {
  it('returns undefined for supported image types within size limit', () => {
    const file = new File([new Uint8Array(100)], 'avatar.png', { type: 'image/png' });

    expect(validateAvatarFile(file)).toBeUndefined();
  });

  it('returns file_type for unsupported mime types', () => {
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' });

    expect(validateAvatarFile(file)).toBe('file_type');
  });
});

const translateAvatarUploadError = (key: string) => key;

describe('getAvatarUploadErrorMessage', () => {
  it('maps storage.not_configured to a user-facing message', () => {
    expect(
      getAvatarUploadErrorMessage({ code: 'storage.not_configured' }, translateAvatarUploadError)
    ).toBe('error_storage_not_configured');
  });

  it('falls back to error_upload for unknown codes', () => {
    expect(
      getAvatarUploadErrorMessage({ code: 'storage.upload_error' }, translateAvatarUploadError)
    ).toBe('error_upload');
  });
});
