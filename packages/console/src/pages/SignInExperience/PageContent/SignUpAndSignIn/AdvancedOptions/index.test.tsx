import resources from '@logto/phrases';
import { type SignInExperience } from '@logto/schemas';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';

import AdvancedOptions from '.';

jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => null,
  BetaTag: () => null,
  CombinedAddOnAndFeatureTag: () => null,
}));
jest.mock('@/consts/env', () => ({ isCloud: false, isDevFeaturesEnabled: false }));
jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('../UsernamePolicy', () => ({ __esModule: true, default: () => null }));
jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({
    match: () => false,
    getPathname: (pathname: string) => pathname,
    getTo: (to: unknown) => to,
    navigate: jest.fn(),
    getUrl: (pathname: string) => new URL(pathname, 'http://localhost'),
  }),
}));

const emptySignInExperience = {};
const signInExperience: SignInExperience = emptySignInExperience as SignInExperience;

function Editor() {
  const form = useForm({
    defaultValues: {
      ssoBrandingBeforeEmailMatch: true,
      createAccountEnabled: true,
      unknownSessionRedirectUrl: '',
    },
  });

  return (
    <FormProvider {...form}>
      <AdvancedOptions signInExperience={signInExperience} />
    </FormProvider>
  );
}

describe('AdvancedOptions SSO branding visibility', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true);
  });

  it('renders the switch on by default', () => {
    render(
      <MemoryRouter>
        <Editor />
      </MemoryRouter>
    );

    const toggle = screen.getByRole('checkbox', {
      name: 'Show SSO connector names and logos before email match',
    });

    expect((toggle as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText('Show SSO connector names and logos before email match')).toBeTruthy();
  });
});
