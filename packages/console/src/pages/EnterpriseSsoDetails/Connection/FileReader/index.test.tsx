import { fireEvent, render, screen } from '@testing-library/react';
import { Controller, useForm } from 'react-hook-form';

import { type EnvTestUtils } from '@/test-utils/env';

import FileReader, { type Props } from '.';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));

const filename = 'metadata.xml';

// Jsdom's `File` has no `text()`.
class XmlFile extends File {
  async text() {
    return '<uploaded />';
  }
}

const attributes: Props['attributes'] = {
  accept: { 'text/xml': [] },
  buttonTitle: 'general.add',
  defaultFilename: filename,
  defaultFileMimeType: 'text/xml',
};

function MetadataField({ metadata }: { readonly metadata?: string }) {
  const {
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<{ metadata?: string }>({ defaultValues: { metadata } });

  return (
    <Controller
      control={control}
      name="metadata"
      render={({ field: { onChange, value } }) => (
        <FileReader
          attributes={attributes}
          value={value}
          fieldError={errors.metadata}
          setError={(fieldError) => {
            setError('metadata', fieldError);
          }}
          clearError={() => {
            clearErrors('metadata');
          }}
          onChange={onChange}
        />
      )}
    />
  );
}

describe('FileReader', () => {
  it('removes a saved file on delete', () => {
    render(<MetadataField metadata="<saved />" />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.queryByText(filename)).toBeNull();
  });

  it('removes an uploaded file on delete', async () => {
    const { container } = render(<MetadataField />);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();

    fireEvent.change(input!, {
      target: { files: [new XmlFile([''], 'idp.xml', { type: 'text/xml' })] },
    });
    await screen.findByText(filename);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.queryByText(filename)).toBeNull();
  });

  it('shows the field error while a file is selected', () => {
    render(
      <FileReader
        attributes={attributes}
        value="<saved />"
        fieldError={{ type: 'custom', message: 'Invalid metadata.' }}
        setError={jest.fn()}
        clearError={jest.fn()}
        onChange={jest.fn()}
      />
    );

    expect(screen.queryByText('Invalid metadata.')).not.toBeNull();
  });

  it('clears a rejected-file error once a valid file is chosen', async () => {
    const { container } = render(<MetadataField />);
    const input = container.querySelector('input')!;

    fireEvent.change(input, {
      target: { files: [new File([''], 'logo.png', { type: 'image/png' })] },
    });
    await screen.findByText(/file type/i);
    fireEvent.change(input, {
      target: { files: [new XmlFile([''], 'idp.xml', { type: 'text/xml' })] },
    });
    await screen.findByText(filename);

    expect(screen.queryByText(/file type/i)).toBeNull();
  });
});
