import { fireEvent, render, waitFor } from '@testing-library/react';

import { uploadAvatar } from '@/apis/experience/avatar';

import AvatarUploadField from '.';

jest.mock('@/apis/experience/avatar', () => ({
  uploadAvatar: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (options?.extensions) {
        return `${key}:${options.extensions}`;
      }
      if (options?.limit) {
        return `${key}:${options.limit}`;
      }
      return key;
    },
    i18n: { dir: () => 'ltr' },
  }),
}));

describe('AvatarUploadField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads a valid image and updates the value', async () => {
    jest.mocked(uploadAvatar).mockResolvedValue({ url: 'https://example.com/avatar.png' });
    const onChange = jest.fn();

    const { container } = render(
      <AvatarUploadField name="avatar" label="Avatar" onChange={onChange} />
    );

    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new TypeError('file input not found');
    }

    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'avatar.jpg', {
      type: 'image/jpeg',
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadAvatar).toHaveBeenCalledWith(file, expect.objectContaining({ signal: expect.any(AbortSignal) }));
      expect(onChange).toHaveBeenCalledWith('https://example.com/avatar.png');
    });
  });

  it('shows a client-side error for unsupported file types', async () => {
    const onChange = jest.fn();

    const { container, getByRole } = render(
      <AvatarUploadField name="avatar" label="Avatar" onChange={onChange} />
    );

    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new TypeError('file input not found');
    }

    const file = new File(['text'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(getByRole('alert').textContent).toBe('error_file_type:JPEG, PNG, GIF, WebP, BMP');
    });
    expect(uploadAvatar).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the value when remove is clicked', async () => {
    const onChange = jest.fn();

    const { getByText } = render(
      <AvatarUploadField
        name="avatar"
        label="Avatar"
        value="https://example.com/avatar.png"
        onChange={onChange}
      />
    );

    fireEvent.click(getByText('remove'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
