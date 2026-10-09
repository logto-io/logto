import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';

import Table from '.';
import type { Column } from './types';

jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ getTo: (path: string) => path }),
}));

jest.mock('@/hooks/use-theme', () => ({
  __esModule: true,
  default: () => 'light',
}));

jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <div>{children}</div>,
}));

const data = [
  { id: 'environment', label: 'Environment', value: 'Non-production' },
  { id: 'plan', label: 'Plan', value: 'Self-hosted Pro' },
];

const columns: Array<Column<(typeof data)[number]>> = [
  { title: null, dataIndex: 'value', render: ({ value }) => value },
  {
    title: null,
    dataIndex: 'label',
    className: 'label',
    colSpan: 2,
    render: ({ label }) => label,
  },
];

describe('<Table />', () => {
  it('keeps body cells as data cells when no column opts into row headers', () => {
    render(<Table rowGroups={[{ key: 'details', data }]} rowIndexKey="id" columns={columns} />);

    expect(screen.queryAllByRole('rowheader')).toHaveLength(0);
    expect(screen.getAllByRole('cell').map(({ tagName }) => tagName)).toEqual([
      'TD',
      'TD',
      'TD',
      'TD',
    ]);
    expect(screen.getByRole('cell', { name: 'Environment' }).getAttribute('scope')).toBeNull();
  });

  it('renders only the opted-in column as row headers, preserving cell props', () => {
    render(
      <Table
        rowGroups={[{ key: 'details', data }]}
        rowIndexKey="id"
        columns={columns.map((column) => ({
          ...column,
          isRowHeader: column.dataIndex === 'label',
        }))}
      />
    );

    expect(screen.queryAllByRole('columnheader')).toHaveLength(0);
    expect(screen.getAllByRole('rowheader').map(({ textContent }) => textContent)).toEqual([
      'Environment',
      'Plan',
    ]);

    const header = screen.getByRole('rowheader', { name: 'Environment' });
    expect(header.tagName).toBe('TH');
    expect(header.getAttribute('scope')).toBe('row');
    expect(header.getAttribute('colspan')).toBe('2');
    expect(header.className).toBe('label');

    const row = screen.getByRole('row', { name: 'Non-production Environment' });
    const value = within(row).getByRole('cell', { name: 'Non-production' });
    expect(value.tagName).toBe('TD');
    expect(value.getAttribute('scope')).toBeNull();
  });
});
