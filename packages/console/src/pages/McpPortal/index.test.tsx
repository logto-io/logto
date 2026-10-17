/* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation -- the route mock's portal id is set between renders */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import useSWR from 'swr';

import McpPortal from '.';

/**
 * Covers the McpPortal page and its portal screens. The API hook and SWR are mocked, so the tests
 * check what the page sends and renders for each connection state, portal, and server.
 */
jest.mock('swr', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/PageMeta', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/RequestDataError', () => ({ __esModule: true, default: () => null }));
let mockPortalId: string | undefined;
jest.mock('react-router-dom', () => ({ useParams: () => ({ portalId: mockPortalId }) }));
jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/scss/page-layout.module.scss', () => ({}));
jest.mock('@/components/FormCard', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));
jest.mock('@/components/DetailsPage', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/DetailsPage/DetailsPageHeader', () => ({
  __esModule: true,
  default: ({ title }: { title: React.ReactNode }) => <div>{title}</div>,
}));
jest.mock('@/ds-components/ModalLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/ds-components/DangerousRaw', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
jest.mock('@/ds-components/CardTitle', () => ({
  __esModule: true,
  default: ({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) => (
    <div>
      {title}
      {subtitle}
    </div>
  ),
}));
jest.mock('@/ds-components/Button', () => ({
  __esModule: true,
  default: ({ title, onClick }: { title?: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {title}
    </button>
  ),
}));
jest.mock('@/ds-components/Table', () => ({
  __esModule: true,
  default: ({
    rowGroups,
    columns,
    placeholder,
  }: {
    rowGroups: Array<{ data?: Array<Record<string, unknown>> }>;
    columns: Array<{
      dataIndex: string;
      render?: (row: Record<string, unknown>) => React.ReactNode;
    }>;
    placeholder?: React.ReactNode;
  }) => {
    const rows = rowGroups.flatMap(({ data }) => data ?? []);

    if (rows.length === 0) {
      return <div>{placeholder}</div>;
    }

    return (
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.id)}>
              {columns.map((column) => (
                <td key={column.dataIndex}>
                  {column.render ? column.render(row) : String(row[column.dataIndex] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));
jest.mock('@/assets/icons/plus.svg?react', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/Search', () => ({
  __esModule: true,
  default: ({ placeholder }: { placeholder?: string }) => <input placeholder={placeholder} />,
}));
jest.mock('@/ds-components/ConfirmModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) =>
    isOpen ? (
      <div>
        <button type="button" onClick={onConfirm}>
          confirm
        </button>
        <button type="button" onClick={onCancel}>
          cancel
        </button>
      </div>
    ) : null,
}));

const post = jest.fn();
const put = jest.fn();
const patch = jest.fn();
const deleteRequest = jest.fn();
const upstreamsMutate = jest.fn();
const portalsMutate = jest.fn();
const connectionMutate = jest.fn();

jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: () => ({ post, put, patch, delete: deleteRequest }),
}));

type Upstream = { name: string; url: string; createdAt: string; enabled?: boolean };
type Portal = {
  id: string;
  name: string;
  hostname: string;
  createdAt: string;
  organizationIds: string[];
};

const portalsKey = 'api/mcp-portal/portals';
const settingsKey = 'api/mcp-portal/settings';
const upstreamsKey = (portalId: string) => `api/mcp-portal/portals/${portalId}/upstreams`;

const portal: Portal = {
  id: 'portal-1',
  name: 'Engineering',
  hostname: 'mcp-eng.example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  organizationIds: [],
};

const kubo: Upstream = {
  name: 'kubo',
  url: 'https://kubo.example.com/mcp',
  createdAt: '2026-01-01T00:00:00.000Z',
};

/** Answers SWR per key: the connection, the portal list, one portal's servers, and organizations. */
const mockState = ({
  portals = [],
  upstreams = [],
  organizations = [],
}: {
  portals?: Portal[];
  upstreams?: Upstream[];
  organizations?: Array<{ id: string; name: string }>;
}) => {
  jest.mocked(useSWR).mockImplementation(((key: string | undefined) => {
    if (key === portalsKey) {
      return { data: { portals }, error: undefined, isLoading: false, mutate: portalsMutate };
    }

    if (key === settingsKey) {
      return {
        data: { baseDomain: 'mcp.meshx.foundation' },
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
      };
    }

    if (key?.startsWith('api/organizations')) {
      return {
        data: [organizations, organizations.length],
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
      };
    }

    if (key?.endsWith('/upstreams')) {
      return { data: { upstreams }, error: undefined, isLoading: false, mutate: upstreamsMutate };
    }

    return { data: undefined, error: undefined, isLoading: false, mutate: jest.fn() };
  }) as unknown as typeof useSWR);
};

const fillForm = (container: HTMLElement, values: Record<string, string>) => {
  for (const [placeholder, value] of Object.entries(values)) {
    fireEvent.change(container.querySelector(`input[placeholder="${placeholder}"]`)!, {
      target: { value },
    });
  }
};

describe('McpPortal', () => {
  beforeEach(() => {
    mockPortalId = undefined;
    for (const mock of [
      post,
      put,
      patch,
      deleteRequest,
      upstreamsMutate,
      portalsMutate,
      connectionMutate,
    ]) {
      mock.mockReset();
    }
    post.mockReturnValue({ json: async () => ({ reachable: true }) });
    put.mockResolvedValue({});
    patch.mockResolvedValue({});
    deleteRequest.mockResolvedValue({});
  });

  it('opens on the new portal form, with no connect step', () => {
    mockState({});
    const { container } = render(<McpPortal />);

    expect(screen.getByText(/MCP Server Portals/)).toBeTruthy();
    expect(container.querySelector('input[type="url"]')).toBeNull();
    expect(screen.queryByText('Reset portal connection')).toBeNull();
  });

  it('shows an empty state when there are no portals', () => {
    mockState({});
    render(<McpPortal />);

    expect(screen.getByText('No portals yet. Add one above.')).toBeTruthy();
  });

  it('lists each portal by name and hostname', () => {
    mockState({ portals: [portal] });
    render(<McpPortal />);

    expect(screen.getByText('Engineering')).toBeTruthy();
    expect(screen.getByText(/mcp-eng\.example\.com/)).toBeTruthy();
  });

  it('creates a portal from a name and subdomain, then refreshes the list', async () => {
    mockState({});
    const { container } = render(<McpPortal />);
    fireEvent.click(screen.getByText('Add server portal'));

    fillForm(container, {
      Engineering: 'Engineering',
      eng: 'ENG',
    });
    fireEvent.submit(screen.getByText('Create portal').closest('form') as HTMLElement);

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith(portalsKey, {
        json: { name: 'Engineering', subdomain: 'eng' },
      });
    });
    expect(portalsMutate).toHaveBeenCalled();
  });

  it('opens a portal to see its servers', () => {
    mockState({ portals: [portal], upstreams: [kubo] });
    mockPortalId = 'portal-1';

    render(<McpPortal />);

    expect(screen.getByText('kubo')).toBeTruthy();
    expect(screen.getByText('https://kubo.example.com/mcp')).toBeTruthy();
  });

  it('shows an empty server list for a new portal', () => {
    mockState({ portals: [portal] });
    mockPortalId = 'portal-1';

    render(<McpPortal />);

    expect(screen.getByText('No MCP servers yet. Add one above.')).toBeTruthy();
  });

  it('posts a new server to the open portal and refreshes its list', async () => {
    mockState({ portals: [portal] });
    mockPortalId = 'portal-1';
    const { container } = render(<McpPortal />);

    fillForm(container, {
      'my-server': 'kubo',
      'https://example.com/mcp': 'https://kubo.example.com/mcp',
    });
    fireEvent.submit(container.querySelector('form[class]')!);

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith(upstreamsKey('portal-1'), {
        json: { name: 'kubo', url: 'https://kubo.example.com/mcp' },
      });
    });
    expect(upstreamsMutate).toHaveBeenCalled();
  });

  it('shows the portal address and a client config to connect with', () => {
    mockState({ portals: [portal] });
    mockPortalId = 'portal-1';
    render(<McpPortal />);

    expect(screen.getByText('https://mcp-eng.example.com/mcp')).toBeTruthy();
    expect(screen.getByText(/mcp-remote@latest/)).toBeTruthy();
  });

  it('warns when a newly added server does not answer', async () => {
    mockState({ portals: [portal] });
    post.mockReturnValue({ json: async () => ({ reachable: false }) });
    mockPortalId = 'portal-1';
    const { container } = render(<McpPortal />);

    fillForm(container, {
      'my-server': 'kubo',
      'https://example.com/mcp': 'https://kubo.example.com/mcp',
    });
    fireEvent.submit(container.querySelector('form[class]')!);

    expect(await screen.findByText(/did not answer/)).toBeTruthy();
  });

  it('removes a server by its encoded name', async () => {
    mockState({ portals: [portal], upstreams: [kubo] });
    mockPortalId = 'portal-1';
    render(<McpPortal />);

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(deleteRequest).toHaveBeenCalledWith(`${upstreamsKey('portal-1')}/kubo`);
    });
    expect(upstreamsMutate).toHaveBeenCalled();
  });

  it('removes a portal after confirmation', async () => {
    mockState({ portals: [portal] });
    render(<McpPortal />);

    fireEvent.click(screen.getByText('Remove'));
    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(deleteRequest).toHaveBeenCalledWith('api/mcp-portal/portals/portal-1');
    });
    expect(portalsMutate).toHaveBeenCalled();
  });

  it('saves the checked organizations as the portal grants', async () => {
    mockState({
      portals: [portal],
      organizations: [
        { id: 'org-a', name: 'Engineering' },
        { id: 'org-b', name: 'Sales' },
      ],
    });
    mockPortalId = 'portal-1';
    render(<McpPortal />);

    fireEvent.click(screen.getByLabelText('Sales'));
    fireEvent.click(screen.getByText('Save access'));

    await waitFor(() => {
      expect(put).toHaveBeenCalledWith('api/mcp-portal/portals/portal-1/organizations', {
        json: { organizationIds: ['org-b'] },
      });
    });
    expect(portalsMutate).toHaveBeenCalled();
  });

  it('starts from the grants the portal already has', () => {
    mockState({
      portals: [{ ...portal, organizationIds: ['org-a'] }],
      organizations: [{ id: 'org-a', name: 'Engineering' }],
    });
    mockPortalId = 'portal-1';
    render(<McpPortal />);

    expect(screen.getByLabelText<HTMLInputElement>('Engineering').checked).toBe(true);
  });

  it('shows an error when adding a server fails', async () => {
    mockState({ portals: [portal] });
    post.mockReturnValue({
      json: async () => {
        throw new Error('conflict');
      },
    });
    mockPortalId = 'portal-1';
    const { container } = render(<McpPortal />);

    fillForm(container, {
      'my-server': 'kubo',
      'https://example.com/mcp': 'https://kubo.example.com/mcp',
    });
    fireEvent.submit(container.querySelector('form[class]')!);

    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});

/* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */
