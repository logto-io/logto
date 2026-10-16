import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import useSWR from 'swr';

import McpPortal from '.';

/**
 * Covers the McpPortal page in src/pages/McpPortal/index.tsx. The API hook and SWR are mocked, so
 * the tests check what the page sends and renders for each connection state.
 */
jest.mock('swr', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/PageMeta', () => ({ __esModule: true, default: () => null }));
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
          confirm-reset
        </button>
        <button type="button" onClick={onCancel}>
          cancel-reset
        </button>
      </div>
    ) : null,
}));
jest.mock('@/components/RequestDataError', () => ({ __esModule: true, default: () => null }));

const post = jest.fn();
const deleteRequest = jest.fn();
const mutate = jest.fn();
const connectionMutate = jest.fn();

jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: () => ({ post, delete: deleteRequest }),
}));

type Upstream = { name: string; url: string; createdAt: string };

const connectionKey = 'api/mcp-portal/connection';

/** Answers SWR per key: the connection state, then the upstream list when configured. */
const mockState = ({
  configured,
  upstreams = [],
}: {
  configured: boolean;
  upstreams?: Upstream[];
}) => {
  jest.mocked(useSWR).mockImplementation(((key: string | undefined) => {
    if (key === connectionKey) {
      return {
        data: { configured, url: configured ? 'https://mcp-portal.example.com' : undefined },
        error: undefined,
        isLoading: false,
        mutate: connectionMutate,
      };
    }

    return {
      data: configured ? { upstreams } : undefined,
      error: undefined,
      isLoading: false,
      mutate,
    };
  }) as unknown as typeof useSWR);
};

const fillAddForm = (container: HTMLElement) => {
  fireEvent.change(container.querySelector('input[placeholder="my-server"]')!, {
    target: { value: 'kubo' },
  });
  fireEvent.change(container.querySelector('input[placeholder="https://example.com/mcp"]')!, {
    target: { value: 'https://kubo.example.com/mcp' },
  });
  fireEvent.submit(container.querySelector('form') as HTMLElement);
};

describe('McpPortal', () => {
  beforeEach(() => {
    post.mockReset();
    deleteRequest.mockReset();
    mutate.mockReset();
    connectionMutate.mockReset();
    post.mockResolvedValue({});
    deleteRequest.mockResolvedValue({});
  });

  it('asks for the portal URL and setup token before the portal is connected', () => {
    mockState({ configured: false });
    render(<McpPortal />);

    expect(screen.getByText('Connect portal')).toBeTruthy();
    expect(screen.queryByText('No MCP servers yet.')).toBeNull();
  });

  it('posts the URL and setup token, then refreshes the connection', async () => {
    mockState({ configured: false });
    const { container } = render(<McpPortal />);

    fireEvent.change(container.querySelector('input[type="url"]')!, {
      target: { value: 'https://mcp-portal.example.com' },
    });
    fireEvent.change(container.querySelectorAll('input')[1] as HTMLElement, {
      target: { value: 'one-time-token' },
    });
    fireEvent.submit(container.querySelector('form') as HTMLElement);

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith(connectionKey, {
        json: { url: 'https://mcp-portal.example.com', token: 'one-time-token' },
      });
    });
    expect(connectionMutate).toHaveBeenCalled();
  });

  it('shows an empty state when the user has no servers', () => {
    mockState({ configured: true });
    render(<McpPortal />);

    expect(screen.getByText('No MCP servers yet.')).toBeTruthy();
  });

  it('lists the user’s servers', () => {
    mockState({
      configured: true,
      upstreams: [
        {
          name: 'kubo',
          url: 'https://kubo.example.com/mcp',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
    render(<McpPortal />);

    expect(screen.getByText('kubo')).toBeTruthy();
    expect(screen.getByText('https://kubo.example.com/mcp')).toBeTruthy();
  });

  it('posts the new server and refreshes the list', async () => {
    mockState({ configured: true });
    const { container } = render(<McpPortal />);

    fillAddForm(container);

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('api/mcp-portal/upstreams', {
        json: { name: 'kubo', url: 'https://kubo.example.com/mcp' },
      });
    });
    expect(mutate).toHaveBeenCalled();
  });

  it('removes a server by its encoded name', async () => {
    mockState({
      configured: true,
      upstreams: [
        {
          name: 'kubo',
          url: 'https://kubo.example.com/mcp',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
    render(<McpPortal />);

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(deleteRequest).toHaveBeenCalledWith('api/mcp-portal/upstreams/kubo');
    });
    expect(mutate).toHaveBeenCalled();
  });

  it('resets the connection after confirmation', async () => {
    mockState({ configured: true });
    render(<McpPortal />);

    fireEvent.click(screen.getByText('Reset connection'));
    fireEvent.click(screen.getByText('confirm-reset'));

    await waitFor(() => {
      expect(deleteRequest).toHaveBeenCalledWith(connectionKey);
    });
    expect(connectionMutate).toHaveBeenCalled();
  });

  it('keeps the connection when the reset is cancelled', () => {
    mockState({ configured: true });
    render(<McpPortal />);

    fireEvent.click(screen.getByText('Reset connection'));
    fireEvent.click(screen.getByText('cancel-reset'));

    expect(deleteRequest).not.toHaveBeenCalled();
  });

  it('shows an error when adding fails', async () => {
    mockState({ configured: true });
    post.mockRejectedValue(new Error('conflict'));
    const { container } = render(<McpPortal />);

    fillAddForm(container);

    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});
