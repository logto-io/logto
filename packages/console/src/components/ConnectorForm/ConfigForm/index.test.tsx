import { ConnectorType } from '@logto/connector-kit';
import { render, screen } from '@testing-library/react';
import type * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { AppDataContext } from '@/contexts/AppDataProvider';
import useAvailableDomains from '@/hooks/use-available-domains';
import type { ConnectorFormType } from '@/types/connector';

import ConfigForm from '.';

jest.mock('@/consts/env', () => ({
  isCloud: false,
}));

jest.mock('@/contexts/AppDataProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    AppDataContext: createContext({}),
  };
});

jest.mock('@/hooks/use-available-domains', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-documentation-url', () => ({
  __esModule: true,
  default: jest.fn(() => ({ getDocumentationUrl: jest.fn() })),
}));

jest.mock('@/ds-components/CodeEditor', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/ds-components/FormField', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/ds-components/TextLink', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/ds-components/CopyToClipboard', () => ({
  __esModule: true,
  default: ({ value }: { readonly value: string }) => <div>{value}</div>,
}));

jest.mock('./ConfigFormFields', () => ({
  __esModule: true,
  default: () => null,
}));

const mockedUseAvailableDomains = jest.mocked(useAvailableDomains);
const appData = { tenantEndpoint: new URL('https://tenant.logto.app') };

function FormWrapper({ children }: { readonly children: React.ReactNode }) {
  const methods = useForm<ConnectorFormType>();

  return (
    <AppDataContext.Provider value={appData}>
      <FormProvider {...methods}>{children}</FormProvider>
    </AppDataContext.Provider>
  );
}

describe('ConfigForm', () => {
  beforeEach(() => {
    mockedUseAvailableDomains.mockReturnValue(['auth.example.com', 'tenant.logto.app']);
  });

  it('shows callback URIs for every domain', () => {
    render(
      <ConfigForm
        formItems={[]}
        connectorId="google"
        connectorFactoryId="google"
        connectorType={ConnectorType.Social}
      />,
      { wrapper: FormWrapper }
    );

    expect(screen.getByText('https://auth.example.com/callback/google')).toBeTruthy();
    expect(
      screen.queryByText('https://auth.example.com/account/callback/social/google')
    ).toBeNull();
    expect(screen.getByText('https://tenant.logto.app/callback/google')).toBeTruthy();
    expect(
      screen.queryByText('https://tenant.logto.app/account/callback/social/google')
    ).toBeNull();
  });

  it('shows only the ACS URL for a SAML connector', () => {
    render(
      <ConfigForm
        formItems={[]}
        connectorId="saml-connector"
        connectorFactoryId="saml"
        connectorType={ConnectorType.Social}
      />,
      { wrapper: FormWrapper }
    );

    expect(screen.getByText('https://auth.example.com/api/authn/saml/saml-connector')).toBeTruthy();
    expect(screen.getByText('https://tenant.logto.app/api/authn/saml/saml-connector')).toBeTruthy();
    expect(screen.queryByText(/\/callback\//)).toBeNull();
  });
});
