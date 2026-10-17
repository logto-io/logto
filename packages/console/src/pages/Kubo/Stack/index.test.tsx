import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import useSWR from 'swr';

import Stack from '.';

const navigate = jest.fn();
const deleteRequest = jest.fn();

jest.mock('swr', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('react-helmet', () => ({ Helmet: () => null }));
jest.mock('@/components/RequestDataError', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/Card', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/ds-components/CardTitle', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/Table', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/Tag', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
jest.mock('@/ds-components/Select', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/Checkbox', () => ({
  __esModule: true,
  default: ({
    label,
    checked,
    onChange,
  }: {
    label: ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onChange(event.currentTarget.checked);
        }}
      />
      {label}
    </label>
  ),
}));
jest.mock('@/ds-components/DeleteConfirmModal', () => {
  function MockDeleteConfirmModal({
    expectedInput,
    inputPlaceholder,
    children,
    onCancel,
    onConfirm,
  }: {
    readonly expectedInput?: string;
    readonly inputPlaceholder?: string;
    readonly children: ReactNode;
    readonly onCancel: () => void;
    readonly onConfirm: () => void;
  }) {
    const [input, setInput] = useState('');
    return (
      <div>
        {children}
        <input
          placeholder={inputPlaceholder}
          value={input}
          onChange={(event) => {
            setInput(event.currentTarget.value);
          }}
        />
        <button type="button" onClick={onCancel}>
          general.cancel
        </button>
        <button type="button" disabled={input !== expectedInput} onClick={onConfirm}>
          general.delete
        </button>
      </div>
    );
  }

  return { __esModule: true, default: MockDeleteConfirmModal };
});
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigate,
  useParams: () => ({ namespace: 'team-a', name: 'foundation' }),
}));
jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: () => ({ delete: deleteRequest, patch: jest.fn(), post: jest.fn() }),
}));
jest.mock('@/ds-components/Button', () => ({
  __esModule: true,
  default: ({
    title,
    disabled,
    onClick,
  }: {
    title?: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {title}
    </button>
  ),
}));

const stack = {
  namespace: 'team-a',
  name: 'foundation',
  mode: 'Direct',
  phase: 'Ready',
  ready: 1,
  total: 1,
  components: [],
};

const renderStack = () => {
  jest.mocked(useSWR).mockReturnValue({
    data: stack,
    error: undefined,
    isLoading: false,
    mutate: jest.fn(),
  } as unknown as ReturnType<typeof useSWR>);
  return render(<Stack />);
};

const openDeleteModal = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Delete stack' }));
};

describe('Kubo stack deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    deleteRequest.mockResolvedValue({});
  });

  it('requires the exact namespace and deletes without purging by default', async () => {
    renderStack();
    openDeleteModal();

    const confirm = screen.getByRole('button', { name: 'general.delete' });
    expect(confirm).toHaveProperty('disabled', true);
    fireEvent.change(screen.getByPlaceholderText('team-a'), { target: { value: 'team' } });
    expect(confirm).toHaveProperty('disabled', true);
    fireEvent.change(screen.getByPlaceholderText('team-a'), { target: { value: 'team-a' } });
    fireEvent.click(confirm);

    await waitFor(() => {
      expect(deleteRequest).toHaveBeenCalledWith('api/kubo/stacks/team-a/foundation?purge=false');
    });
    expect(navigate).toHaveBeenCalledWith('/infrastructure', { replace: true });
  });

  it('keeps the modal open and reports a deletion failure', async () => {
    deleteRequest.mockRejectedValue(new Error('Deletion blocked'));
    renderStack();
    openDeleteModal();
    fireEvent.change(screen.getByPlaceholderText('team-a'), { target: { value: 'team-a' } });
    fireEvent.click(screen.getByRole('button', { name: 'general.delete' }));

    expect(await screen.findByText('Deletion blocked')).toBeTruthy();
    expect(screen.getByPlaceholderText('team-a')).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('resets confirmation and purge state when reopened', () => {
    renderStack();
    openDeleteModal();
    fireEvent.change(screen.getByPlaceholderText('team-a'), { target: { value: 'team-a' } });
    fireEvent.click(screen.getByLabelText(/also delete the namespace/i));
    fireEvent.click(screen.getByRole('button', { name: 'general.cancel' }));
    openDeleteModal();

    expect(screen.getByPlaceholderText('team-a')).toHaveProperty('value', '');
    expect(screen.getByLabelText(/also delete the namespace/i)).toHaveProperty('checked', false);
  });

  it('does not delete when the namespace purge warning is cancelled', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderStack();
    openDeleteModal();
    fireEvent.change(screen.getByPlaceholderText('team-a'), { target: { value: 'team-a' } });
    fireEvent.click(screen.getByLabelText(/also delete the namespace/i));
    fireEvent.click(screen.getByRole('button', { name: 'general.delete' }));

    expect(window.confirm).toHaveBeenCalledWith(
      'Deleting namespace "team-a" removes everything in it, not just this stack. Continue?'
    );
    expect(deleteRequest).not.toHaveBeenCalled();
  });
});
