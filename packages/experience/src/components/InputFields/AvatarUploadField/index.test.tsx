import { fireEvent, render, waitFor } from '@testing-library/react';

import { uploadAvatar } from '@/apis/experience/avatar';

import AvatarUploadField from '.';

jest.mock('@/apis/experience/avatar', () => ({
  uploadAvatar: jest.fn(),
}));

jest.mock('@/utils/image-crop', () => ({
  getCroppedImageBlob: jest.fn(async () => new Blob([new Uint8Array([1])], { type: 'image/jpeg' })),
}));

// Render the crop modal inline and immediately report a crop area so confirming works in jsdom.
jest.mock('react-modal', () => ({
  __esModule: true,
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="crop-modal">{children}</div> : null,
}));

jest.mock('react-easy-crop', () => ({
  __esModule: true,
  // The cropper reports the crop area synchronously so confirming has a value to export.
  default: ({
    onCropComplete,
  }: {
    onCropComplete: (area: unknown, areaPixels: unknown) => void;
  }) => {
    onCropComplete({}, { x: 0, y: 0, width: 100, height: 100 });
    return <div data-testid="cropper" />;
  },
}));

const selectFile = (container: HTMLElement, file: File) => {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new TypeError('file input not found');
  }
  fireEvent.change(input, { target: { files: [file] } });
};

const validImageFile = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff])], 'avatar.jpg', { type: 'image/jpeg' });

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

const urlObjectHelpersSnapshot = {
  createObjectURL: undefined as typeof URL.createObjectURL | undefined,
  revokeObjectURL: undefined as typeof URL.revokeObjectURL | undefined,
};

describe('AvatarUploadField', () => {
  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    urlObjectHelpersSnapshot.createObjectURL = globalThis.URL.createObjectURL;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    urlObjectHelpersSnapshot.revokeObjectURL = globalThis.URL.revokeObjectURL;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // The jsdom environment does not implement object URL helpers used by the crop flow.
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.URL.createObjectURL = jest.fn(() => 'blob:mock-avatar');
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.URL.createObjectURL =
      urlObjectHelpersSnapshot.createObjectURL ?? (() => 'blob:restored');
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.URL.revokeObjectURL = urlObjectHelpersSnapshot.revokeObjectURL ?? jest.fn();
  });

  it('opens the crop modal on selection and uploads the cropped image after confirming', async () => {
    jest.mocked(uploadAvatar).mockResolvedValue({ url: 'https://example.com/avatar.png' });
    const onChange = jest.fn();

    const { container, getByTestId, getByText } = render(
      <AvatarUploadField name="avatar" label="Avatar" onChange={onChange} />
    );

    selectFile(container, validImageFile());

    // The crop modal opens and no upload happens yet.
    await waitFor(() => {
      expect(getByTestId('crop-modal')).toBeTruthy();
    });
    expect(uploadAvatar).not.toHaveBeenCalled();

    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(uploadAvatar).toHaveBeenCalledTimes(1);
    });

    const [uploadedFile, options] = jest.mocked(uploadAvatar).mock.calls[0] ?? [];
    expect(uploadedFile).toBeInstanceOf(File);
    expect(uploadedFile?.type).toBe('image/jpeg');
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(onChange).toHaveBeenCalledWith('https://example.com/avatar.png');
  });

  it('shows a client-side error for unsupported file types', async () => {
    const onChange = jest.fn();

    const { container, getByRole, queryByTestId } = render(
      <AvatarUploadField name="avatar" label="Avatar" onChange={onChange} />
    );

    selectFile(container, new File(['text'], 'notes.txt', { type: 'text/plain' }));

    await waitFor(() => {
      expect(getByRole('alert').textContent).toBe('error_file_type:JPEG, PNG, GIF, WebP, BMP');
    });
    expect(queryByTestId('crop-modal')).toBeNull();
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

    const { container, getByText } = render(
      <AvatarUploadField
        name="avatar"
        label="Avatar"
        onChange={onChange}
        onUploadingChange={onUploadingChange}
      />
    );

    selectFile(container, validImageFile());

    fireEvent.click(getByText('action.save'));

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
