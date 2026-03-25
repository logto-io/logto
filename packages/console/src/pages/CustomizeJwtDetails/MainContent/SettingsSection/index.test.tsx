import { LogtoJwtTokenKeyType } from '@logto/schemas';
import { fireEvent, render, screen } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { JwtCustomizerForm } from '@/pages/CustomizeJwtDetails/type';

import SettingsSection from '.';

jest.mock('@/assets/icons/book.svg?react', () => () => <svg />, { virtual: true });
jest.mock('@/assets/icons/conical-flask.svg?react', () => () => <svg />, { virtual: true });
jest.mock('@/assets/icons/caret-expanded.svg?react', () => () => <svg />, { virtual: true });

const mockTranslations: Record<string, string> = {
  'jwt_claims.data_source_tab': 'Data source',
  'jwt_claims.error_handling_tab': 'Error handling',
  'jwt_claims.test_tab': 'Test context',
  'jwt_claims.error_handling.input_field_title': 'Token issuance behavior on script error',
  'jwt_claims.error_handling.block_issuance_switch': 'Block token issuance when the script errors',
};

jest.mock('@monaco-editor/react', () => ({
  Editor: () => <div data-testid="monaco-editor" />,
}));

jest.mock('@/ds-components/Button', () => ({
  __esModule: true,
  default: ({ title, onClick }: { title: string; onClick?: () => void }) => (
    <button onClick={onClick}>{mockTranslations[title] ?? title}</button>
  ),
}));

jest.mock('@/ds-components/FormField', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; readonly children: ReactNode }) => (
    <div>
      <div>{mockTranslations[title] ?? title}</div>
      {children}
    </div>
  ),
}));

jest.mock('@/ds-components/InlineNotification', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/ds-components/Switch', () => ({
  __esModule: true,
  default: ({
    description,
    checked,
    onChange,
  }: {
    description: string;
    checked?: boolean;
    onChange?: (event: { currentTarget: { checked: boolean } }) => void;
  }) => (
    <label>
      <span>{mockTranslations[description] ?? description}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onChange?.({ currentTarget: { checked: event.currentTarget.checked } });
        }}
      />
    </label>
  ),
}));

jest.mock('./InstructionTab/EnvironmentVariablesField', () => ({
  __esModule: true,
  default: ({ className }: { className?: string }) => (
    <div className={className}>Environment variables field</div>
  ),
}));

jest.mock('@/consts/env', () => ({
  isDevFeaturesEnabled: true,
}));

jest.mock('@/pages/CustomizeJwtDetails/utils/config', () => ({
  __esModule: true,
  denyAccessCodeExample: 'deny access sample',
  environmentVariablesCodeExample: 'environment variables sample',
  fetchExternalDataCodeExample: 'fetch external data sample',
  sampleCodeEditorOptions: {},
  typeDefinitionCodeEditorOptions: {},
}));

jest.mock('./TestTab', () => ({
  __esModule: true,
  default: ({ isActive }: { isActive: boolean }) =>
    isActive ? <div>Test tab content</div> : <div hidden>Test tab content</div>,
}));

const resources = {
  admin_console: {
    jwt_claims: {
      data_source_tab: 'Data source',
      error_handling_tab: 'Error handling',
      test_tab: 'Test context',
      jwt_claims_description: 'Default claims are auto-included.',
      tester: {
        subtitle: 'Adjust mock token and user data for testing.',
      },
      form_error: {
        invalid_json: 'Invalid JSON format',
      },
      token_data: {
        title: 'Token payload',
        subtitle: 'Token payload subtitle',
      },
      user_data: {
        title: 'User context',
        subtitle: 'User context subtitle',
      },
      grant_data: {
        title: 'Grant context',
        subtitle: 'Grant context subtitle',
      },
      interaction_data: {
        title: 'User interaction context',
        subtitle: 'User interaction context subtitle',
      },
      application_data: {
        title: 'Application context',
        subtitle: 'Application context subtitle',
      },
      fetch_external_data: {
        title: 'Fetch external data',
        subtitle: 'Fetch external data subtitle',
        description: 'Fetch external data description',
      },
      environment_variables: {
        title: 'Set environment variables',
        subtitle: 'Environment variables subtitle',
        input_field_title: 'Add environment variables',
        sample_code: 'Accessing environment variables sample code',
      },
      api_context: {
        title: 'API context: access control',
        subtitle: 'API context subtitle',
      },
      error_handling: {
        title: 'Error handling',
        subtitle: 'Error handling subtitle',
        input_field_title: 'Token issuance behavior on script error',
        block_issuance_switch: 'Block token issuance when the script errors',
        warning: 'Error handling warning',
      },
    },
  },
};

function Wrapper({ children }: { readonly children: ReactNode }) {
  const methods = useForm<JwtCustomizerForm>({
    defaultValues: {
      tokenType: LogtoJwtTokenKeyType.AccessToken,
      script: '',
      blockIssuanceOnError: false,
      environmentVariables: [],
      testSample: {},
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('<SettingsSection />', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources, true, true);
  });

  it('renders a dedicated error handling tab and keeps the setting out of data source', () => {
    render(<SettingsSection />, { wrapper: Wrapper });

    expect(
      screen.getByRole('button', {
        name: 'Data source',
      })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', {
        name: 'Error handling',
      })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', {
        name: 'Test context',
      })
    ).toBeTruthy();

    expect(screen.queryByText('Token issuance behavior on script error')).toBeNull();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Error handling',
      })
    );

    expect(screen.getByText('Token issuance behavior on script error')).toBeTruthy();
  });
});
