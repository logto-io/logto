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

const localizedMessage = '无法读取压缩包。请重新创建一个非空的 ZIP 文件并上传。';
const genericMessage = 'admin_console.components.uploader.error_upload';

function TestUploader({
  error,
  isErrorMessageAllowed = true,
}: {
  readonly error: Error;
  readonly isErrorMessageAllowed?: boolean;
}) {
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
        allowedErrorCodes={isErrorMessageAllowed ? allowedErrorCodes : undefined}
        onUploadErrorChange={setMessage}
      />
      <div role="alert">{message}</div>
    </>
  );
}

describe('FileUploader error messages', () => {
  it.each([
    ...allowedErrorCodes.map((code) => ({
      status: 400,
      body: { code, message: localizedMessage, details: 'private details' },
      allowErrors: true,
      expected: localizedMessage,
    })),
    {
      status: 500,
      body: {
        code: 'storage.upload_error',
        message: 'private storage error',
        data: { details: 'secret' },
      },
      allowErrors: true,
      expected: genericMessage,
    },
    {
      status: 400,
      body: { code: 'guard.invalid_input', message: 'internal error' },
      allowErrors: true,
      expected: genericMessage,
    },
    {
      status: 500,
      body: { code: allowedErrorCodes[0], message: 'internal error' },
      allowErrors: true,
      expected: genericMessage,
    },
    {
      status: 400,
      body: { code: allowedErrorCodes[0], message: localizedMessage },
      allowErrors: false,
      expected: genericMessage,
    },
    { status: 400, body: null, allowErrors: true, expected: genericMessage },
  ])(
    'only displays opted-in 400 validation messages: %j',
    async ({ status, body, allowErrors, expected }) => {
      const error = new HTTPError(
        { status, statusText: '', clone: () => ({ json: async () => body }) } as Response,
        {} as Request,
        {} as NormalizedOptions
      );
      const { container } = render(
        <TestUploader error={error} isErrorMessageAllowed={allowErrors} />
      );
      const input = container.querySelector('input');
      expect(input).not.toBeNull();
      fireEvent.change(input!, {
        target: { files: [new File(['zip'], 'assets.zip', { type: 'application/zip' })] },
      });

      await screen.findByText(expected);
      expect(screen.getByRole('alert').textContent).toBe(expected);
    }
  );
});
