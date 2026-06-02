/* eslint-disable max-lines */
import type { SignInExperienceResponse } from '@experience/shared/types';
import { getCroppedImageBlob } from '@experience/utils/image-crop';
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

import { updateAvatar, updateCustomData, updateName, updateProfile } from '../../apis/account';
import { uploadAccountAvatar } from '../../apis/avatar';

import Profile from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('../../apis/account', () => ({
  updateAvatar: jest.fn(),
  updateCustomData: jest.fn(),
  updateName: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('../../apis/avatar', () => ({
  uploadAccountAvatar: jest.fn(),
}));

// The avatar field opens a crop modal on selection; stub the cropper/canvas so the flow runs in jsdom.
jest.mock('@experience/utils/image-crop', () => ({
  getCroppedImageBlob: jest.fn(async () => new Blob([new Uint8Array([1])], { type: 'image/jpeg' })),
}));

jest.mock('react-easy-crop', () => ({
  __esModule: true,
  default: ({
    onCropComplete,
  }: {
    onCropComplete: (area: unknown, areaPixels: unknown) => void;
  }) => {
    onCropComplete({}, { x: 0, y: 0, width: 100, height: 100 });
    return null;
  },
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

const requiredNicknameField = {
  tenantId: 'default',
  id: 'nickname',
  name: 'nickname',
  type: CustomProfileFieldType.Text,
  label: 'Nickname',
  description: null,
  required: true,
  config: {},
  createdAt: 0,
  sieOrder: 0,
} satisfies CustomProfileField;

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

const newsletterField = {
  tenantId: 'default',
  id: 'newsletter',
  name: 'newsletter',
  type: CustomProfileFieldType.Checkbox,
  label: 'Newsletter',
  description: null,
  required: false,
  config: { defaultValue: 'false' },
  createdAt: 0,
  sieOrder: 0,
} satisfies CustomProfileField;

const fullnameField = {
  tenantId: 'default',
  id: 'fullname',
  name: 'fullname',
  type: CustomProfileFieldType.Fullname,
  label: 'Full name',
  description: null,
  required: false,
  config: {
    parts: [
      {
        name: 'givenName',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Given name',
        required: false,
      },
      {
        name: 'familyName',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Family name',
        required: false,
      },
    ],
  },
  createdAt: 0,
  sieOrder: 0,
} satisfies CustomProfileField;

const addressField = {
  tenantId: 'default',
  id: 'address',
  name: 'address',
  type: CustomProfileFieldType.Address,
  label: 'Address',
  description: null,
  required: false,
  config: {
    parts: [
      {
        name: 'streetAddress',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Street address',
        required: false,
      },
      {
        name: 'country',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Country',
        required: false,
      },
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

const urlObjectHelpersSnapshot = {
  createObjectURL: undefined as typeof URL.createObjectURL | undefined,
  revokeObjectURL: undefined as typeof URL.revokeObjectURL | undefined,
};

describe('<Profile />', () => {
  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    urlObjectHelpersSnapshot.createObjectURL = globalThis.URL.createObjectURL;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    urlObjectHelpersSnapshot.revokeObjectURL = globalThis.URL.revokeObjectURL;
  });

  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    jest.mocked(updateAvatar).mockResolvedValue(undefined);
    jest.mocked(updateCustomData).mockResolvedValue(undefined);
    jest.mocked(updateName).mockResolvedValue(undefined);
    jest.mocked(updateProfile).mockResolvedValue(undefined);
    // `resetAllMocks` clears the factory implementation, so restore the cropper stub each run.
    jest
      .mocked(getCroppedImageBlob)
      .mockResolvedValue(new Blob([new Uint8Array([1])], { type: 'image/jpeg' }));
    // Jsdom does not implement object URL helpers used by the avatar crop flow.
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.URL.createObjectURL = jest.fn(() => 'blob:mock-avatar');
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.URL.createObjectURL =
      urlObjectHelpersSnapshot.createObjectURL ?? (() => 'blob:restored');
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.URL.revokeObjectURL = urlObjectHelpersSnapshot.revokeObjectURL ?? jest.fn();
  });

  it('renders editable profile fields with expected sections and edit entries', () => {
    const { queryAllByText, queryByAltText, queryByText } = renderProfile();

    expect(queryByText('account_center.page.profile_title')).not.toBeNull();
    expect(queryByText('account_center.page.profile_description')).not.toBeNull();

    expect(queryByText('name')).not.toBeNull();
    expect(queryByText('Alex')).not.toBeNull();

    expect(queryByAltText('avatar')).not.toBeNull();

    expect(queryByText('birthdate')).not.toBeNull();
    expect(queryByText('2023-08-20')).not.toBeNull();

    expect(queryByText('Favorite color')).not.toBeNull();
    expect(queryByText('Red')).not.toBeNull();

    expect(queryAllByText('account_center.security.change')).toHaveLength(4);
  });

  it('renders read-only profile fields in display-only state', () => {
    const { queryByAltText, queryByText } = renderProfile({
      accountCenterSettings: {
        fields: {
          name: AccountCenterControlValue.ReadOnly,
          avatar: AccountCenterControlValue.ReadOnly,
          profile: AccountCenterControlValue.ReadOnly,
          customData: AccountCenterControlValue.ReadOnly,
        },
      },
    });

    expect(queryByText('Alex')).not.toBeNull();
    expect(queryByAltText('Alex')).not.toBeNull();
    expect(queryByText('2023-08-20')).not.toBeNull();
    expect(queryByText('Red')).not.toBeNull();
    expect(queryByText('account_center.security.change')).toBeNull();
  });

  it('hides off and unavailable profile fields', () => {
    const { queryByText } = renderProfile({
      accountCenterSettings: {
        fields: {
          name: AccountCenterControlValue.Off,
          avatar: AccountCenterControlValue.Off,
          profile: AccountCenterControlValue.Off,
          customData: AccountCenterControlValue.Off,
        },
      },
    });

    expect(queryByText('name')).toBeNull();
    expect(queryByText('avatar')).toBeNull();
    expect(queryByText('birthdate')).toBeNull();
    expect(queryByText('Favorite color')).toBeNull();
    expect(queryByText('account_center.security.change')).toBeNull();
  });

  it('renders only fields configured in profileFields', () => {
    const { queryByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [{ name: 'name' }],
      },
    });

    expect(queryByText('name')).not.toBeNull();
    expect(queryByText('Alex')).not.toBeNull();
    expect(queryByText('avatar')).toBeNull();
    expect(queryByText('birthdate')).toBeNull();
    expect(queryByText('Favorite color')).toBeNull();
  });

  it('does not render profile card when profileFields is empty', () => {
    const { queryByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [],
      },
    });

    expect(queryByText('account_center.page.profile_title')).not.toBeNull();
    expect(queryByText('name')).toBeNull();
    expect(queryByText('account_center.security.change')).toBeNull();
  });

  it('renders avatar image when available and upload placeholder when missing (edit mode)', () => {
    const { queryByAltText, unmount } = renderProfile();

    expect(queryByAltText('avatar')).not.toBeNull();

    unmount();

    const { queryByAltText: queryMissingAvatarAltText } = renderProfile({
      userInfo: {
        avatar: null,
      },
    });

    expect(queryMissingAvatarAltText('avatar')).toBeNull();
  });

  it('shows only change action for avatar when an image is set', () => {
    const { queryByText } = renderProfile();

    expect(queryByText('profile.avatar_upload.remove')).toBeNull();
    expect(queryByText('profile.avatar_upload.upload')).toBeNull();
  });

  it('crops then uploads avatar and persists URL via updateAvatar', async () => {
    const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
    const setToast = jest.fn();
    const mockUrl = 'https://example.com/new-avatar.png';
    jest.mocked(uploadAccountAvatar).mockResolvedValueOnce({ url: mockUrl });

    const { container, getByText } = renderProfile({ refreshUserInfo, setToast });
    const fileInput = container.querySelector('input[type="file"]')!;
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'avatar.jpg', {
      type: 'image/jpeg',
    });

    // Selecting a file opens the crop modal; the upload only happens after confirming.
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(uploadAccountAvatar).not.toHaveBeenCalled();

    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(uploadAccountAvatar).toHaveBeenCalledWith(
        'access-token',
        expect.any(File),
        expect.any(Object)
      );
    });
    await waitFor(() => {
      expect(updateAvatar).toHaveBeenCalledWith('access-token', { avatar: mockUrl });
    });
  });

  it('keeps the crop modal open when persist fails after upload', async () => {
    const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
    const setToast = jest.fn();
    const mockUrl = 'https://example.com/new-avatar.png';
    jest.mocked(uploadAccountAvatar).mockResolvedValueOnce({ url: mockUrl });
    jest.mocked(updateAvatar).mockRejectedValue(new Error('network error'));

    const { container, getByText } = renderProfile({ refreshUserInfo, setToast });
    const fileInput = container.querySelector('input[type="file"]')!;
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'avatar.jpg', {
      type: 'image/jpeg',
    });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateAvatar).toHaveBeenCalledWith('access-token', { avatar: mockUrl });
    });
    await waitFor(() => {
      expect(getByText('profile.avatar_upload.error_save')).toBeTruthy();
    });
    expect(getByText('action.save')).toBeTruthy();
    expect(refreshUserInfo).not.toHaveBeenCalled();
    expect(setToast).not.toHaveBeenCalled();

    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateAvatar).toHaveBeenCalledTimes(2);
    });
    expect(uploadAccountAvatar).toHaveBeenCalledTimes(1);
  });

  it('renders avatar image in read-only mode with label and not_set placeholder', () => {
    const { queryByAltText, unmount } = renderProfile({
      accountCenterSettings: {
        fields: {
          avatar: AccountCenterControlValue.ReadOnly,
        },
      },
    });

    expect(queryByAltText('Alex')).not.toBeNull();

    unmount();

    const { queryByAltText: queryMissingAvatarAltText, queryByText: queryMissingAvatarText } =
      renderProfile({
        accountCenterSettings: {
          fields: {
            avatar: AccountCenterControlValue.ReadOnly,
          },
        },
        userInfo: {
          avatar: null,
        },
      });

    expect(queryMissingAvatarAltText('Alex')).toBeNull();
    expect(queryMissingAvatarText('account_center.security.not_set')).not.toBeNull();
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

  it('renders custom data checkbox fields with yes/no labels', () => {
    const { getByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [{ name: 'newsletter' }],
      },
      experienceSettings: {
        customProfileFields: [newsletterField],
      },
      userInfo: {
        customData: {
          newsletter: true,
        },
      },
    });

    expect(getByText('Yes')).toBeTruthy();
  });

  it('renders built-in checkbox fields from profile data', () => {
    const { getByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [{ name: 'nickname' }],
      },
      experienceSettings: {
        customProfileFieldCatalog: [
          {
            ...requiredNicknameField,
            type: CustomProfileFieldType.Checkbox,
            config: { defaultValue: 'false' },
          },
        ],
      },
      userInfo: {
        profile: {
          nickname: 'true',
        },
      },
    });

    expect(getByText('Yes')).toBeTruthy();
  });

  it('updates custom data checkbox fields', async () => {
    const { getByText, queryAllByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [{ name: 'newsletter' }],
      },
      experienceSettings: {
        customProfileFields: [newsletterField],
      },
      userInfo: {
        customData: {
          newsletter: false,
          retained: 'value',
        },
      },
    });

    fireEvent.click(queryAllByText('account_center.security.change')[0]!);
    fireEvent.click(document.querySelector('input[type="checkbox"]')!);
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateCustomData).toHaveBeenCalledWith('access-token', {
        newsletter: true,
        retained: 'value',
      });
    });
  });

  it('updates custom data fields without dropping existing custom data', async () => {
    const { getByText, queryAllByText } = renderProfile();

    fireEvent.click(queryAllByText('account_center.security.change')[3]!);
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

  it('updates fullname composite field via profile API', async () => {
    const { getByDisplayValue, getByText, queryAllByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [{ name: 'fullname' }],
      },
      experienceSettings: {
        customProfileFields: [fullnameField],
      },
      userInfo: {
        profile: {
          givenName: 'Alex',
          familyName: 'Smith',
        },
      },
    });

    fireEvent.click(queryAllByText('account_center.security.change')[0]!);
    fireEvent.change(getByDisplayValue('Alex'), { target: { value: 'Jane' } });
    fireEvent.change(getByDisplayValue('Smith'), { target: { value: 'Doe' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith('access-token', {
        givenName: 'Jane',
        familyName: 'Doe',
      });
    });
  });

  it('updates address composite field via profile API', async () => {
    const { getByDisplayValue, getByText, queryAllByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [{ name: 'address' }],
      },
      experienceSettings: {
        customProfileFields: [addressField],
      },
      userInfo: {
        profile: {
          address: {
            streetAddress: '123 Main St',
            country: 'US',
          },
        },
      },
    });

    fireEvent.click(queryAllByText('account_center.security.change')[0]!);
    fireEvent.change(getByDisplayValue('123 Main St'), { target: { value: '456 Oak Ave' } });
    fireEvent.change(getByDisplayValue('US'), { target: { value: 'CA' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith('access-token', {
        address: {
          formatted: '456 Oak Ave, CA',
          streetAddress: '456 Oak Ave',
          country: 'CA',
        },
      });
    });
  });

  it('edits birthdate with segmented date inputs', async () => {
    const { getByText, queryAllByText } = renderProfile();

    fireEvent.click(queryAllByText('account_center.security.change')[2]!);

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

  it('keeps the modal open and reports errors when the update API fails', async () => {
    const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
    const setToast = jest.fn();
    jest.mocked(updateName).mockRejectedValue(new Error('network error'));

    const { getByDisplayValue, getByText, queryAllByText } = renderProfile({
      refreshUserInfo,
      setToast,
    });

    fireEvent.click(queryAllByText('account_center.security.change')[0]!);
    fireEvent.change(getByDisplayValue('Alex'), { target: { value: 'Alex Changed' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith('error.unknown');
    });
    expect(refreshUserInfo).not.toHaveBeenCalled();
    expect(getByText('action.save')).toBeTruthy();
  });

  it('does not mark required custom data fields as optional in the edit modal', () => {
    const { queryByText, queryAllByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [{ name: 'employeeId' }],
      },
      experienceSettings: {
        customProfileFields: [],
        customProfileFieldCatalog: [
          {
            ...requiredNicknameField,
            name: 'employeeId',
            label: 'Employee ID',
          },
        ],
      },
    });

    fireEvent.click(queryAllByText('account_center.security.change')[0]!);

    expect(queryByText('(Optional)')).toBeNull();
  });

  it('blocks submit for required fields and does not call the update API', async () => {
    const { getByText, queryAllByText } = renderProfile({
      accountCenterSettings: {
        profileFields: [{ name: 'nickname' }],
      },
      experienceSettings: {
        customProfileFields: [requiredNicknameField],
      },
      userInfo: {
        profile: {
          nickname: 'Alex',
        },
      },
    });

    fireEvent.click(queryAllByText('account_center.security.change')[0]!);
    fireEvent.change(document.querySelector('input[name="nickname"]')!, {
      target: { value: '' },
    });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(getByText('error.general_required')).toBeTruthy();
    });
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('shows a validation error for invalid birthdate input', async () => {
    const { getByText, queryAllByText } = renderProfile();

    fireEvent.click(queryAllByText('account_center.security.change')[2]!);

    const [yearInput, monthInput, dayInput] = document.querySelectorAll(
      'input[inputmode="numeric"]'
    );

    fireEvent.change(yearInput!, { target: { value: '2024' } });
    fireEvent.change(monthInput!, { target: { value: '13' } });
    fireEvent.change(dayInput!, { target: { value: '01' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(getByText('error.general_invalid')).toBeTruthy();
    });
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('clears the name field by sending null to the update API', async () => {
    const { getByDisplayValue, getByText, queryAllByText } = renderProfile();

    fireEvent.click(queryAllByText('account_center.security.change')[0]!);
    fireEvent.change(getByDisplayValue('Alex'), { target: { value: '' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateName).toHaveBeenCalledWith('access-token', { name: null });
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
/* eslint-enable max-lines */
