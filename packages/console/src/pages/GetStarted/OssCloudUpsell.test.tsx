/* eslint-disable react/prefer-read-only-props */
import { render, screen } from '@testing-library/react';

import OssCloudUpsell from './OssCloudUpsell';
import styles from './index.module.scss';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/consts', () => ({
  officialWebsiteContactPageLink: 'https://logto.io/contact',
}));

jest.mock('@/ds-components/Button', () => ({
  __esModule: true,
  default: ({
    title,
    trailingIcon,
    type,
  }: {
    title?: string;
    trailingIcon?: React.ReactNode;
    type?: string;
  }) => (
    <button type="button" data-button-type={type}>
      {title}
      {trailingIcon}
    </button>
  ),
  LinkButton: ({ title }: { title: string }) => <a href="/contact">{title}</a>,
}));

jest.mock('@/ds-components/Card', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/ds-components/IconButton', () => ({
  __esModule: true,
  default: ({ children, ...rest }: { children: React.ReactNode }) => (
    <button type="button" {...rest}>
      {children}
    </button>
  ),
}));

jest.mock('@/ds-components/Spacer', () => () => <div />);
jest.mock('@/ds-components/Tag', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('<OssCloudUpsell />', () => {
  it('renders the figma-specified icon assets', () => {
    const { container } = render(<OssCloudUpsell isBannerVisible onDismissBanner={jest.fn()} />);

    expect(container.querySelector('[data-file-name="SvgSparkles"]')).not.toBeNull();
    expect(container.querySelector('[data-file-name="SvgPrivateCloud"]')).not.toBeNull();
    expect(container.querySelector('[data-file-name="SvgLightening"]')).not.toBeNull();
    expect(screen.queryByTestId('SvgCloud')).toBeNull();
    expect(screen.queryByTestId('SvgRocket')).toBeNull();
  });

  it('renders a dedicated styled close icon button', () => {
    render(<OssCloudUpsell isBannerVisible onDismissBanner={jest.fn()} />);

    const dismissButton = screen.getByRole('button', { name: 'general.close' });
    const dismissIcon = dismissButton.querySelector('svg');

    expect(dismissButton.classList.contains(styles.dismissButton ?? '')).toBe(true);
    expect(dismissIcon?.classList.contains(styles.dismissIcon ?? '')).toBe(true);
  });

  it('uses a solid primary CTA instead of the branding gradient button', () => {
    render(<OssCloudUpsell isBannerVisible onDismissBanner={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: /get_started\.oss_cloud\.try\.action/i }).dataset
        .buttonType
    ).toBe('primary');
  });
});
/* eslint-enable react/prefer-read-only-props */
