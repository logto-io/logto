import { validateAvatarFile } from './avatar-upload';

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
