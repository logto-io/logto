import type { SignInExperienceResponse } from '@experience/shared/types';
import {
  AccountCenterControlValue,
  CustomProfileFieldType,
  Gender,
  type AccountCenter,
  type CustomProfileField,
  type UserProfileResponse,
} from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';

import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
  mockUserInfo,
} from '@ac/__mocks__/RenderWithPageContext';

import { updateCustomData, updateName, updateProfile } from '../../apis/account';

import Profile from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('../../apis/account', () => ({
  updateCustomData: jest.fn(),
  updateName: jest.fn(),
  updateProfile: jest.fn(),
}));

type ProfileRenderOptions = {
  readonly accountCenterSettings?: Omit<Partial<AccountCenter>, 'fields'> & {
    readonly fields?: Partial<AccountCenter['fields']>;
  };
  readonly experienceSettings?: Partial<SignInExperienceResponse>;
  readonly userInfo?: Partial<UserProfileResponse>;
  readonly refreshUserInfo?: () => Promise<void>;
  readonly setToast?: PageContextType['setToast'];
};

const favoriteColorField = {
  tenantId: 'default',
  id: 'favoriteColor',
  name: 'favoriteColor',
  type: CustomProfileFieldType.Select,
  label: 'Favorite color',
  description: null,
  required: false,
  config: {
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
    ],
  },
  createdAt: 0,
  sieOrder: 0,
} satisfies CustomProfileField;

const renderProfile = ({
  accountCenterSettings,
  experienceSettings,
  userInfo,
  refreshUserInfo,
  setToast,
}: ProfileRenderOptions = {}) => {
  const { fields, ...accountCenterSettingsOverrides } = accountCenterSettings ?? {};

  return renderWithPageContext(
    <Profile />,
    {
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      },
    },
    {
      pageContext: {
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          profileFields: [
            { name: 'name' },
            { name: 'avatar' },
            { name: 'birthdate' },
            { name: 'favoriteColor' },
          ],
          fields: {
            ...mockAccountCenterSettings.fields,
            ...fields,
          },
          ...accountCenterSettingsOverrides,
        },
        experienceSettings: {
          ...mockSignInExperienceSettings,
          customProfileFields: [favoriteColorField],
          ...experienceSettings,
        },
        userInfo: {
          ...mockUserInfo,
          avatar: 'https://example.com/avatar.png',
          profile: {
            birthdate: '2023-08-20',
          },
          customData: {
            favoriteColor: 'red',
            retained: 'value',
          },
          ...userInfo,
        },
        ...(refreshUserInfo && { refreshUserInfo }),
        ...(setToast && { setToast }),
      },
    }
  );
};

describe('<Profile />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    jest.mocked(updateCustomData).mockResolvedValue(undefined);
    jest.mocked(updateName).mockResolvedValue(undefined);
    jest.mocked(updateProfile).mockResolvedValue(undefined);
  });

  it('renders change actions for editable non-avatar fields', () => {
    const { queryAllByText } = renderProfile();

    expect(queryAllByText('account_center.security.change')).toHaveLength(3);
  });

  it('updates the name field from the edit modal', async () => {
    const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
    const setToast = jest.fn();
    const { getByDisplayValue, getByText, queryAllByText } = renderProfile({
      refreshUserInfo,
      setToast,
    });

    fireEvent.click(queryAllByText('account_center.security.change')[0]!);
    fireEvent.change(getByDisplayValue('Alex'), { target: { value: 'Alex Changed' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateName).toHaveBeenCalledWith('access-token', { name: 'Alex Changed' });
    });
    expect(refreshUserInfo).toHaveBeenCalledTimes(1);
    expect(setToast).toHaveBeenCalledWith('account_center.update_success.default.description');
  });

  it('updates custom data fields without dropping existing custom data', async () => {
    const { getByText, queryAllByText } = renderProfile();

    fireEvent.click(queryAllByText('account_center.security.change')[2]!);
    fireEvent.click(document.querySelector('input[name="favoriteColor"]')!);
    fireEvent.click(getByText('Blue'));
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateCustomData).toHaveBeenCalledWith('access-token', {
        favoriteColor: 'blue',
        retained: 'value',
      });
    });
  });

  it('renders built-in gender with translated label', () => {
    const { getByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [{ name: 'gender' }],
      },
      userInfo: {
        profile: {
          gender: Gender.Male,
        },
      },
    });

    expect(getByText('profile.gender_options.male')).toBeTruthy();
  });

  it('edits birthdate with segmented date inputs', async () => {
    const { getByText, queryAllByText } = renderProfile();

    fireEvent.click(queryAllByText('account_center.security.change')[1]!);

    const [yearInput, monthInput, dayInput] = document.querySelectorAll(
      'input[inputmode="numeric"]'
    );

    fireEvent.change(yearInput!, { target: { value: '2024' } });
    fireEvent.change(monthInput!, { target: { value: '01' } });
    fireEvent.change(dayInput!, { target: { value: '02' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith('access-token', {
        birthdate: '2024-01-02',
      });
    });
  });

  it('does not show change actions for read-only fields', () => {
    const { queryByText } = renderProfile({
      accountCenterSettings: {
        fields: {
          name: AccountCenterControlValue.ReadOnly,
          avatar: AccountCenterControlValue.ReadOnly,
          profile: AccountCenterControlValue.ReadOnly,
          customData: AccountCenterControlValue.ReadOnly,
        },
      },
    });

    expect(queryByText('account_center.security.change')).toBeNull();
  });
});
