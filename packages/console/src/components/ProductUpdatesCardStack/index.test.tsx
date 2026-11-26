import resources from '@logto/phrases';
import { Theme } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { fireEvent, render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { useMemo, useState } from 'react';

import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { type EnvTestUtils } from '@/test-utils/env';

import DefaultProductUpdatesCardStack, {
  ProductUpdatesCardStack,
  type ProductUpdateItem,
  type ProductUpdatesCardStackProps,
} from '.';
import { formatFullPublishedDate, formatShortPublishedDate } from './utils';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));

const sampleItems: ProductUpdateItem[] = [
  {
    id: 'custom-domain-account-center',
    title: 'Custom Domains for Account Center',
    summary: 'Serve end-user profile, password, and MFA management under each brand domain.',
    publishedDate: '2026-11-20T08:00:00Z',
    url: 'https://logto.io/updates/custom-domain-account-center',
  },
  {
    id: 'organization-passkey-enforcement',
    title: 'Organization Passkey Policies',
    summary: 'Require WebAuthn passkeys or TOTP per B2B organization.',
    publishedDate: '2026-11-18T10:30:00Z',
    url: 'https://logto.io/updates/organization-passkey-enforcement',
  },
  {
    id: 'saml-idp-metadata-auto-sync',
    title: 'Auto-Sync SAML IdP Certificates',
    summary: 'Signing certificates refresh automatically via Metadata URL.',
    publishedDate: '2026-11-14T09:00:00Z',
    url: 'https://logto.io/updates/saml-idp-metadata-auto-sync',
  },
  {
    id: 'webhook-test-inspector',
    title: 'Live Webhook Test Inspector',
    summary: 'Send signed test events and inspect headers, status, and latency.',
    publishedDate: '2026-11-09T11:00:00Z',
    url: 'https://logto.io/updates/webhook-test-inspector',
  },
  {
    id: 'custom-jwt-claims-v2',
    title: 'Custom JWT Claims Debugging',
    summary: 'Preview token payloads and trace custom claims directly in Console.',
    publishedDate: '2026-11-02T12:00:00Z',
    url: 'https://logto.io/updates/custom-jwt-claims-v2',
  },
];

function StatefulStack({
  initialItems,
  onOpen = jest.fn(),
  onDismiss,
  onDismissAll,
  onActiveItemChange,
}: {
  readonly initialItems: readonly ProductUpdateItem[];
  readonly onOpen?: ProductUpdatesCardStackProps['onOpen'];
  readonly onDismiss?: ProductUpdatesCardStackProps['onDismiss'];
  readonly onDismissAll?: ProductUpdatesCardStackProps['onDismissAll'];
  readonly onActiveItemChange?: ProductUpdatesCardStackProps['onActiveItemChange'];
}) {
  const [items, setItems] = useState<readonly ProductUpdateItem[]>(initialItems);

  return (
    <ProductUpdatesCardStack
      items={items}
      onOpen={onOpen}
      onDismiss={(item) => {
        onDismiss?.(item);
        setItems((current) => current.filter((entry) => entry.id !== item.id));
      }}
      onDismissAll={() => {
        onDismissAll?.();
        setItems([]);
      }}
      onActiveItemChange={onActiveItemChange}
    />
  );
}

function DarkThemeWrapper({ children }: { readonly children: React.ReactNode }) {
  const value = useMemo(
    () => ({
      theme: Theme.Dark,
      setAppearanceMode: noop,
      setThemeOverride: noop,
    }),
    []
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

describe('ProductUpdatesCardStack', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true);
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-20T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when items is empty', () => {
    const onActiveItemChange = jest.fn();
    const { container } = render(
      <DefaultProductUpdatesCardStack
        items={[]}
        onOpen={jest.fn()}
        onDismiss={jest.fn()}
        onDismissAll={jest.fn()}
        onActiveItemChange={onActiveItemChange}
      />
    );

    expect(container.firstChild).toBeNull();
    expect(onActiveItemChange).not.toHaveBeenCalled();
  });

  it('renders a single card without clear all button and formats today date', () => {
    const onActiveItemChange = jest.fn();
    const firstItem = sampleItems[0]!;

    render(
      <ProductUpdatesCardStack
        items={[firstItem]}
        onOpen={jest.fn()}
        onDismiss={jest.fn()}
        onDismissAll={jest.fn()}
        onActiveItemChange={onActiveItemChange}
      />
    );

    expect(screen.getByRole('region', { name: 'Product updates' })).not.toBeNull();
    expect(screen.getAllByTestId('product-update-front-card')).toHaveLength(1);
    expect(screen.queryAllByTestId('product-update-back-card')).toHaveLength(0);
    expect(screen.getByText('Today')).not.toBeNull();
    expect(screen.getByText(firstItem.title)).not.toBeNull();
    expect(screen.getByText(firstItem.summary)).not.toBeNull();
    expect(screen.getByText('Read more')).not.toBeNull();
    expect(screen.queryByRole('button', { name: /clear all/i })).toBeNull();
    expect(onActiveItemChange).toHaveBeenCalledTimes(1);
    expect(onActiveItemChange).toHaveBeenCalledWith(firstItem);
  });

  it('renders up to 3 visible layers for 3 items with newest on top', () => {
    const threeItems = sampleItems.slice(0, 3);

    render(
      <ProductUpdatesCardStack
        items={threeItems}
        onOpen={jest.fn()}
        onDismiss={jest.fn()}
        onDismissAll={jest.fn()}
      />
    );

    expect(screen.getAllByTestId('product-update-front-card')).toHaveLength(1);
    const backCards = screen.getAllByTestId('product-update-back-card');
    expect(backCards).toHaveLength(2);
    for (const card of backCards) {
      expect(card.getAttribute('aria-hidden')).toBe('true');
    }

    expect(screen.getByRole('button', { name: 'Clear all (3)' })).not.toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link').getAttribute('href')).toBe(threeItems[0]!.url);
  });

  it('caps visible layers at 3 for 5 items, shows accurate count, and steps through all items', () => {
    const onDismiss = jest.fn();
    const onActiveItemChange = jest.fn();

    render(
      <StatefulStack
        initialItems={sampleItems}
        onDismiss={onDismiss}
        onActiveItemChange={onActiveItemChange}
      />
    );

    expect(screen.getAllByTestId('product-update-front-card')).toHaveLength(1);
    expect(screen.getAllByTestId('product-update-back-card')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Clear all (5)' })).not.toBeNull();
    expect(onActiveItemChange).toHaveBeenLastCalledWith(sampleItems[0]);

    // Dismiss 1 -> 4 left (still capped at 3 visible layers)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenLastCalledWith(sampleItems[0]);
    expect(screen.getAllByTestId('product-update-back-card')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Clear all (4)' })).not.toBeNull();
    expect(screen.getByRole('link').getAttribute('href')).toBe(sampleItems[1]!.url);
    expect(onActiveItemChange).toHaveBeenLastCalledWith(sampleItems[1]);

    // Dismiss 2 -> 3 left (still 3 visible layers)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.getAllByTestId('product-update-back-card')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Clear all (3)' })).not.toBeNull();
    expect(onActiveItemChange).toHaveBeenLastCalledWith(sampleItems[2]);

    // Dismiss 3 -> 2 left (2 visible layers)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.getAllByTestId('product-update-back-card')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear all (2)' })).not.toBeNull();
    expect(onActiveItemChange).toHaveBeenLastCalledWith(sampleItems[3]);

    // Dismiss 4 -> 1 left (1 visible layer, no Clear all)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryAllByTestId('product-update-back-card')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /clear all/i })).toBeNull();
    expect(screen.getByRole('link').getAttribute('href')).toBe(sampleItems[4]!.url);
    expect(onActiveItemChange).toHaveBeenLastCalledWith(sampleItems[4]);

    // Dismiss 5 -> empty
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('region', { name: 'Product updates' })).toBeNull();
    expect(onActiveItemChange).toHaveBeenCalledTimes(5);
  });

  it('invokes onOpen, onDismiss, and onDismissAll independently', () => {
    const onOpen = jest.fn();
    const onDismiss = jest.fn();
    const onDismissAll = jest.fn();

    render(
      <ProductUpdatesCardStack
        items={sampleItems.slice(0, 3)}
        onOpen={onOpen}
        onDismiss={onDismiss}
        onDismissAll={onDismissAll}
      />
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe(sampleItems[0]!.url);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');

    fireEvent.click(link);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(sampleItems[0]);
    expect(onDismiss).not.toHaveBeenCalled();
    expect(onDismissAll).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(sampleItems[0]);
    expect(onOpen).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Clear all (3)' }));
    expect(onDismissAll).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not re-fire onActiveItemChange when rerendered with the same top item', () => {
    const onActiveItemChange = jest.fn();
    const { rerender } = render(
      <ProductUpdatesCardStack
        items={sampleItems.slice(0, 2)}
        onOpen={jest.fn()}
        onDismiss={jest.fn()}
        onDismissAll={jest.fn()}
        onActiveItemChange={onActiveItemChange}
      />
    );

    expect(onActiveItemChange).toHaveBeenCalledTimes(1);

    rerender(
      <ProductUpdatesCardStack
        items={sampleItems.slice(0, 3)}
        onOpen={jest.fn()}
        onDismiss={jest.fn()}
        onDismissAll={jest.fn()}
        onActiveItemChange={onActiveItemChange}
      />
    );

    expect(onActiveItemChange).toHaveBeenCalledTimes(1);
  });

  it('supports Escape key dismissal and restores focus to the next card link', () => {
    const onDismiss = jest.fn();

    render(<StatefulStack initialItems={sampleItems.slice(0, 2)} onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    dismissButton.focus();
    expect(document.activeElement).toBe(dismissButton);

    fireEvent.keyDown(dismissButton, { key: 'Escape' });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(sampleItems[0]);

    const nextLink = screen.getByRole('link');
    expect(nextLink.getAttribute('href')).toBe(sampleItems[1]!.url);
    expect(document.activeElement).toBe(nextLink);
  });

  it('applies dark theme styling class in dark mode', () => {
    render(
      <DarkThemeWrapper>
        <ProductUpdatesCardStack
          items={sampleItems.slice(0, 1)}
          onOpen={jest.fn()}
          onDismiss={jest.fn()}
          onDismissAll={jest.fn()}
        />
      </DarkThemeWrapper>
    );

    const region = screen.getByRole('region', { name: 'Product updates' });
    expect(region.className).toContain('dark');
  });

  it('formats dates cleanly including previous year and invalid date fallback', () => {
    const now = new Date('2026-11-20T12:00:00Z');
    expect(formatShortPublishedDate('2026-11-20T08:00:00Z', 'en', 'Today', now)).toBe('Today');
    expect(formatShortPublishedDate('2026-11-18T10:30:00Z', 'en', 'Today', now)).toBe('Nov 18');
    expect(formatShortPublishedDate('2025-12-28T10:30:00Z', 'en', 'Today', now)).toContain('2025');
    expect(formatShortPublishedDate('not-a-date', 'en', 'Today', now)).toBe('');
    expect(formatFullPublishedDate('2026-11-18T10:30:00Z', 'en')).toContain('2026');
    expect(formatFullPublishedDate('not-a-date', 'en')).toBe('');
  });
});
