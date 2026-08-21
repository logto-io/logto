import { render, screen } from '@testing-library/react';
import type * as React from 'react';

import CustomUiForm from '.';

const mockIsCloud = jest.fn(() => false);

jest.mock('@/consts/env', () => ({
  get isCloud() {
    return mockIsCloud();
  },
}));

jest.mock('@/consts/subscriptions', () => ({ latestProPlanId: 'pro' }));

jest.mock('@/contexts/SubscriptionDataProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    SubscriptionDataContext: createContext({
      currentSubscriptionQuota: { bringYourUiEnabled: false },
    }),
  };
});

jest.mock('react-hook-form', () => ({
  Controller: () => null,
  useFormContext: () => ({ control: {} }),
}));

jest.mock('@/hooks/use-documentation-url', () => ({
  __esModule: true,
  default: () => ({ getDocumentationUrl: jest.fn() }),
}));

jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => <span>Pro</span>,
  CloudTag: ({ children }: { readonly children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/CustomCssEditorField', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/ds-components/Card', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <section>{children}</section>,
}));

jest.mock('@/ds-components/DynamicT', () => ({
  __esModule: true,
  default: ({ forKey }: { readonly forKey: string }) => forKey,
}));

jest.mock('@/ds-components/FormField', () => ({
  __esModule: true,
  default: ({
    children,
    title,
  }: {
    readonly children: React.ReactNode;
    readonly title: React.ReactNode;
  }) => (
    <section>
      <div>{title}</div>
      {children}
    </section>
  ),
}));

jest.mock('@/ds-components/TextLink', () => ({
  __esModule: true,
  default: ({ children }: { readonly children?: React.ReactNode }) => (
    <a href="https://cloud.logto.io/">{children}</a>
  ),
}));

jest.mock('@/pages/SignInExperience/components/CustomUiAssetsUploader', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('./CustomUiCspForm', () => ({
  __esModule: true,
  default: () => null,
}));

describe('CustomUiForm', () => {
  afterEach(() => {
    mockIsCloud.mockReturnValue(false);
  });

  it('shows only the Cloud tag for Bring your UI in OSS', () => {
    render(<CustomUiForm />);

    expect(screen.getByText('sign_in_exp.custom_ui.cloud_tag')).toBeTruthy();
    expect(screen.queryByText('Pro')).toBeNull();
  });

  it('shows the Pro tag for Bring your UI in Cloud when the feature is unavailable', () => {
    mockIsCloud.mockReturnValue(true);

    render(<CustomUiForm />);

    expect(screen.getByText('Pro')).toBeTruthy();
    expect(screen.queryByText('sign_in_exp.custom_ui.cloud_tag')).toBeNull();
  });
});
