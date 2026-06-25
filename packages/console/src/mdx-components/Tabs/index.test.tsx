import { fireEvent, render, screen } from '@testing-library/react';

import TabItem from '../TabItem';

import Tabs from '.';

const renderVersionTabs = (groupId?: string, testId = 'tabs') => (
  <Tabs groupId={groupId}>
    <TabItem value="v2" label="v2">
      <span data-testid={`${testId}-content`}>v2 content</span>
    </TabItem>
    <TabItem value="v1" label="v1">
      <span data-testid={`${testId}-content`}>v1 content</span>
    </TabItem>
  </Tabs>
);

describe('<Tabs />', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('selects the first tab by default and switches on click', async () => {
    render(renderVersionTabs());

    expect(screen.getByRole('tab', { name: 'v2' }).getAttribute('aria-selected')).toBe('true');

    fireEvent.click(screen.getByRole('tab', { name: 'v1' }));

    expect(screen.getByRole('tab', { name: 'v1' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'v2' }).getAttribute('aria-selected')).toBe('false');
  });

  it('keeps tab groups sharing the same `groupId` in sync', async () => {
    render(
      <>
        {renderVersionTabs('sync-test', 'first')}
        {renderVersionTabs('sync-test', 'second')}
      </>
    );

    const [firstV1, secondV1] = screen.getAllByRole('tab', { name: 'v1' });
    const [firstV2, secondV2] = screen.getAllByRole('tab', { name: 'v2' });

    // Both groups start on the default first tab.
    expect(firstV2?.getAttribute('aria-selected')).toBe('true');
    expect(secondV2?.getAttribute('aria-selected')).toBe('true');

    // Switching one group switches the other.
    fireEvent.click(firstV1!);

    expect(firstV1?.getAttribute('aria-selected')).toBe('true');
    expect(secondV1?.getAttribute('aria-selected')).toBe('true');

    // And it is persisted for future visits.
    expect(localStorage.getItem('logto:admin_console:guide_tab_group:sync-test')).toBe('v1');
  });

  it('does not sync tab groups without a `groupId`', async () => {
    render(
      <>
        {renderVersionTabs(undefined, 'first')}
        {renderVersionTabs(undefined, 'second')}
      </>
    );

    const [firstV1] = screen.getAllByRole('tab', { name: 'v1' });
    const [, secondV2] = screen.getAllByRole('tab', { name: 'v2' });

    fireEvent.click(firstV1!);

    expect(firstV1?.getAttribute('aria-selected')).toBe('true');
    // The second group stays on its own default selection.
    expect(secondV2?.getAttribute('aria-selected')).toBe('true');
  });

  it('restores the persisted choice on mount', () => {
    localStorage.setItem('logto:admin_console:guide_tab_group:restore-test', 'v1');

    render(renderVersionTabs('restore-test'));

    expect(screen.getByRole('tab', { name: 'v1' }).getAttribute('aria-selected')).toBe('true');
  });
});
