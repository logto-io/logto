import type { UserProfileResponse } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import ReactModal from 'react-modal';

import useApi from '@/hooks/use-api';

import UnlockUserModal from '.';

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ getTo: (path: string) => path }),
}));

jest.mock('@/scss/modal.module.scss', () => ({}));

jest.mock('@/components/FeatureTag', () => ({
  CombinedAddOnAndFeatureTag: () => null,
}));

const mockPost = jest.fn();
const mockOnClose = jest.fn();
const mockedUseApi = jest.mocked(useApi);

type User = Pick<UserProfileResponse, 'id' | 'primaryEmail' | 'primaryPhone' | 'username'>;

const user: User = {
  id: 'user-id',
  primaryEmail: 'primary@example.com',
  primaryPhone: '+61412345678',
  username: 'primary-user',
};

const renderModal = (userData: User = user) =>
  render(<UnlockUserModal isOpen user={userData} onClose={mockOnClose} />);

describe('UnlockUserModal', () => {
  beforeAll(() => {
    const appElement = document.createElement('div');
    document.body.append(appElement);
    ReactModal.setAppElement(appElement);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue(undefined);
    mockedUseApi.mockReturnValue({
      post: mockPost,
    } as unknown as ReturnType<typeof useApi>);
  });

  it('unlocks the user with the user ID and every primary identifier', async () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', { name: 'admin_console.user_details.unlock_action' })
    );

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('api/sentinel-activities/delete', {
        json: {
          targetType: 'User',
          targets: ['user-id', 'primary@example.com', '+61412345678', 'primary-user'],
        },
      });
    });
    expect(toast.success).toHaveBeenCalledWith('admin_console.user_details.user_unlocked');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('unlocks a user that only has a user ID', async () => {
    renderModal({ id: 'user-id', primaryEmail: null, primaryPhone: null, username: null });

    fireEvent.click(
      screen.getByRole('button', { name: 'admin_console.user_details.unlock_action' })
    );

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('api/sentinel-activities/delete', {
        json: {
          targetType: 'User',
          targets: ['user-id'],
        },
      });
    });
  });

  it('does not send a request when the confirmation is cancelled', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.cancel' }));

    expect(mockPost).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
