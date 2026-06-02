import { fireEvent, render, waitFor } from '@testing-library/react';

import { uploadAccountAvatar } from '@ac/apis/avatar';

import AvatarUploadField from '.';

const mockGetAccessToken = jest.fn();

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('@ac/apis/avatar', () => ({
  uploadAccountAvatar: jest.fn(),
}));

jest.mock('@experience/utils/image-crop', () => ({
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

const selectFile = (container: HTMLElement, file: File) => {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new TypeError('file input not found');
  }
  fireEvent.change(input, { target: { files: [file] } });
};

const validImageFile = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff])], 'avatar.jpg', { type: 'image/jpeg' });

const urlObjectHelpersSnapshot = {
  createObjectURL: undefined as typeof URL.createObjectURL | undefined,
  revokeObjectURL: undefined as typeof URL.revokeObjectURL | undefined,
};

describe('AvatarUploadField (account center)', () => {
  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    urlObjectHelpersSnapshot.createObjectURL = globalThis.URL.createObjectURL;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    urlObjectHelpersSnapshot.revokeObjectURL = globalThis.URL.revokeObjectURL;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    // Jsdom does not implement object URL helpers used by the crop flow.
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
    jest.mocked(uploadAccountAvatar).mockResolvedValue({ url: 'https://example.com/avatar.png' });
    const onChange = jest.fn();

    const { container, getByTestId, getByText } = render(
      <AvatarUploadField label="Avatar" onChange={onChange} />
    );

    selectFile(container, validImageFile());

    // The crop modal opens and no upload happens yet.
    await waitFor(() => {
      expect(getByTestId('crop-modal')).toBeTruthy();
    });
    expect(uploadAccountAvatar).not.toHaveBeenCalled();

    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(uploadAccountAvatar).toHaveBeenCalledTimes(1);
    });

    const [accessToken, uploadedFile, options] =
      jest.mocked(uploadAccountAvatar).mock.calls[0] ?? [];
    expect(accessToken).toBe('access-token');
    expect(uploadedFile).toBeInstanceOf(File);
    expect(uploadedFile?.type).toBe('image/jpeg');
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(onChange).toHaveBeenCalledWith('https://example.com/avatar.png');
  });

  it('shows a client-side error for unsupported file types and does not open the modal', async () => {
    const onChange = jest.fn();

    const { container, getByRole, queryByTestId } = render(
      <AvatarUploadField label="Avatar" onChange={onChange} />
    );

    selectFile(container, new File(['text'], 'notes.txt', { type: 'text/plain' }));

    await waitFor(() => {
      expect(getByRole('alert').textContent).toBe('error_file_type:JPEG, PNG, GIF, WebP, BMP');
    });
    expect(queryByTestId('crop-modal')).toBeNull();
    expect(uploadAccountAvatar).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('surfaces a generic error and does not update the value when upload fails', async () => {
    jest.mocked(uploadAccountAvatar).mockRejectedValue(new Error('network error'));
    const onChange = jest.fn();

    const { container, getByTestId, getByText, getByRole } = render(
      <AvatarUploadField label="Avatar" onChange={onChange} />
    );

    selectFile(container, validImageFile());

    await waitFor(() => {
      expect(getByTestId('crop-modal')).toBeTruthy();
    });

    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(getByRole('alert').textContent).toBe('error_upload');
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
