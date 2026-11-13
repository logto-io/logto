import { fireEvent, render, screen } from '@testing-library/react';
import { Controller, useForm } from 'react-hook-form';

import { type EnvTestUtils } from '@/test-utils/env';

import FileReader from '.';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));

const filename = 'metadata.xml';

// Jsdom's `File` has no `text()`.
class XmlFile extends File {
  async text() {
    return '<uploaded />';
  }
}

function MetadataField({ metadata }: { readonly metadata?: string }) {
  const { control } = useForm<{ metadata?: string }>({ defaultValues: { metadata } });

  return (
    <Controller
      control={control}
      name="metadata"
      render={({ field: { onChange, value } }) => (
        <FileReader
          attributes={{
            accept: { 'text/xml': [] },
            buttonTitle: 'general.add',
            defaultFilename: filename,
            defaultFileMimeType: 'text/xml',
          }}
          value={value}
          setError={jest.fn()}
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
});
