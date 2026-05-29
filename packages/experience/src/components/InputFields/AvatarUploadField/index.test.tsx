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
      expect(uploadAvatar).toHaveBeenCalledTimes(1);
    });

    const [uploadedFile, options] = jest.mocked(uploadAvatar).mock.calls[0] ?? [];
    expect(uploadedFile).toBe(file);
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(onChange).toHaveBeenCalledWith('https://example.com/avatar.png');
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

  it('notifies the parent when upload state changes', async () => {
    jest.mocked(uploadAvatar).mockImplementation(
      async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ url: 'https://example.com/avatar.png' });
          }, 50);
        })
    );
    const onUploadingChange = jest.fn();
    const onChange = jest.fn();

    const { container } = render(
      <AvatarUploadField
        name="avatar"
        label="Avatar"
        onChange={onChange}
        onUploadingChange={onUploadingChange}
      />
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
      expect(onUploadingChange).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(onUploadingChange).toHaveBeenCalledWith(false);
    });
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

  it('does not show remove when the field is required', () => {
    const onChange = jest.fn();

    const { queryByText } = render(
      <AvatarUploadField
        isRequired
        name="avatar"
        label="Avatar"
        value="https://example.com/avatar.png"
        onChange={onChange}
      />
    );

    expect(queryByText('remove')).toBeNull();
  });
});
