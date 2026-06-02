import {
  buildCroppedAvatarFile,
  getAvatarPersistErrorMessage,
  getAvatarUploadErrorMessage,
  validateAvatarFile,
} from './avatar-upload';

describe('buildCroppedAvatarFile', () => {
  it('derives a jpeg filename from the original selection', () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' });
    const file = buildCroppedAvatarFile(blob, 'My Photo.png');

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('My Photo.jpg');
    expect(file.type).toBe('image/jpeg');
  });

  it('falls back to a default name when no original name is provided', () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' });
    const file = buildCroppedAvatarFile(blob);

    expect(file.name).toBe('avatar.jpg');
  });
});

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

describe('getAvatarPersistErrorMessage', () => {
  it('maps storage.not_configured to a user-facing message', () => {
    expect(
      getAvatarPersistErrorMessage({ code: 'storage.not_configured' }, translateAvatarUploadError)
    ).toBe('error_storage_not_configured');
  });

  it('falls back to error_save for unknown codes', () => {
    expect(
      getAvatarPersistErrorMessage({ code: 'entity.not_found' }, translateAvatarUploadError)
    ).toBe('error_save');
  });
});
