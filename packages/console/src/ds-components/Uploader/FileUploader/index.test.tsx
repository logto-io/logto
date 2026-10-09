import { type LogtoErrorCode } from '@logto/phrases';
import { fireEvent, render, screen } from '@testing-library/react';
import ky, { HTTPError, type NormalizedOptions } from 'ky';
import { useState } from 'react';

import FileUploader from '.';

jest.mock('@/hooks/use-api', () => ({ __esModule: true, default: () => ky.create({}) }));

const allowedErrorCodes: LogtoErrorCode[] = [
  'storage.invalid_custom_ui_zip',
  'storage.custom_ui_file_too_large',
  'storage.custom_ui_too_many_entries',
];

const genericMessage = 'admin_console.components.uploader.error_upload';

function TestUploader({ error }: { readonly error: Error }) {
  const [message, setMessage] = useState<string>();
  const api = ky.create({});
  jest.spyOn(api, 'post').mockImplementation(() => {
    throw error;
  });

  return (
    <>
      <FileUploader
        apiInstance={api}
        uploadUrl="https://example.com/upload"
        maxSize={1024}
        allowedMimeTypes={['application/zip']}
        allowedErrorCodes={allowedErrorCodes}
        onUploadErrorChange={setMessage}
      />
      <div role="alert">{message}</div>
    </>
  );
}

describe('FileUploader error messages', () => {
  it.each([
    {
      status: 500,
      body: {
        code: 'storage.upload_error',
        message: 'private storage error',
        data: { details: 'secret' },
      },
    },
    {
      status: 400,
      body: { code: 'guard.invalid_input', message: 'internal error' },
    },
    {
      status: 500,
      body: { code: allowedErrorCodes[0], message: 'internal error' },
    },
    { status: 400, body: null },
  ])('keeps non-validation failures generic: %j', async ({ status, body }) => {
    const error = new HTTPError(
      { status, statusText: '', clone: () => ({ json: async () => body }) } as Response,
      {} as Request,
      {} as NormalizedOptions
    );
    const { container } = render(<TestUploader error={error} />);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    fireEvent.change(input!, {
      target: { files: [new File(['zip'], 'assets.zip', { type: 'application/zip' })] },
    });

    await screen.findByText(genericMessage);
    expect(screen.getByRole('alert').textContent).toBe(genericMessage);
  });
});
