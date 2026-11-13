import { fireEvent, render, screen } from '@testing-library/react';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { type SamlConnectorConfig } from '@/pages/EnterpriseSsoDetails/types/saml';
import { type EnvTestUtils } from '@/test-utils/env';

import SamlMetadataForm from '.';
import { FormFormat } from './SwitchFormatButton';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => null,
  CombinedAddOnAndFeatureTag: () => null,
}));
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: false } }),
}));
jest.mock('./SwitchFormatButton', () => ({
  ...jest.requireActual<Record<string, unknown>>('./SwitchFormatButton'),
  __esModule: true,
  default: ({ onChange }: { readonly onChange: (format: string) => void }) => (
    <>
      <button
        type="button"
        onClick={() => {
          onChange('url');
        }}
      >
        url
      </button>
      <button
        type="button"
        onClick={() => {
          onChange('xml');
        }}
      >
        xml
      </button>
    </>
  ),
}));

const config: SamlConnectorConfig = { metadata: '<saved />' };

function Form() {
  const errors = useMemo(
    () => ({ metadata: { type: 'custom', message: 'Invalid metadata.' } }),
    []
  );
  const methods = useForm<SamlConnectorConfig>({ defaultValues: config, errors });

  return (
    <FormProvider {...methods}>
      <SamlMetadataForm config={config} />
    </FormProvider>
  );
}

describe('SamlMetadataForm', () => {
  it('drops field errors when switching formats', () => {
    render(<Form />);
    expect(screen.queryByText('Invalid metadata.')).not.toBeNull();

    fireEvent.click(screen.getByText(FormFormat.Url));
    fireEvent.click(screen.getByText(FormFormat.Xml));

    expect(screen.queryByText('Invalid metadata.')).toBeNull();
  });
});
