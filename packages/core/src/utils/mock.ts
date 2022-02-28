import {
  User,
  userInfoSelectFields,
  Application,
  ApplicationType,
  Resource,
  ResourceScope,
  Role,
  Setting,
  SignInExperience,
  BrandingStyle,
  Language,
  Connector,
  Passcode,
  PasscodeType,
  UserLog,
  UserLogType,
  UserLogResult,
} from '@logto/schemas';
import pick from 'lodash.pick';

export const mockUser: User = {
  id: 'foo',
  username: 'foo',
  primaryEmail: 'foo@logto.io',
  primaryPhone: '111111',
  roleNames: ['admin'],
  passwordEncrypted: null,
  passwordEncryptionMethod: null,
  passwordEncryptionSalt: null,
  name: null,
  avatar: null,
  identities: {},
  customData: {},
};

export const mockUserResponse = pick(mockUser, ...userInfoSelectFields);

export const mockUserList: User[] = [
  {
    id: '1',
    username: 'foo1',
    primaryEmail: 'foo1@logto.io',
    primaryPhone: '111111',
    roleNames: ['admin'],
    passwordEncrypted: null,
    passwordEncryptionMethod: null,
    passwordEncryptionSalt: null,
    name: null,
    avatar: null,
    identities: {},
    customData: {},
  },
  {
    id: '2',
    username: 'foo2',
    primaryEmail: 'foo2@logto.io',
    primaryPhone: '111111',
    roleNames: ['admin'],
    passwordEncrypted: null,
    passwordEncryptionMethod: null,
    passwordEncryptionSalt: null,
    name: null,
    avatar: null,
    identities: {},
    customData: {},
  },
  {
    id: '3',
    username: 'foo3',
    primaryEmail: 'foo3@logto.io',
    primaryPhone: '111111',
    roleNames: ['admin'],
    passwordEncrypted: null,
    passwordEncryptionMethod: null,
    passwordEncryptionSalt: null,
    name: null,
    avatar: null,
    identities: {},
    customData: {},
  },
  {
    id: '4',
    username: 'bar1',
    primaryEmail: 'bar1@logto.io',
    primaryPhone: '111111',
    roleNames: ['admin'],
    passwordEncrypted: null,
    passwordEncryptionMethod: null,
    passwordEncryptionSalt: null,
    name: null,
    avatar: null,
    identities: {},
    customData: {},
  },
  {
    id: '5',
    username: 'bar2',
    primaryEmail: 'bar2@logto.io',
    primaryPhone: '111111',
    roleNames: ['admin'],
    passwordEncrypted: null,
    passwordEncryptionMethod: null,
    passwordEncryptionSalt: null,
    name: null,
    avatar: null,
    identities: {},
    customData: {},
  },
];

export const mockUserListResponse = mockUserList.map((user) => pick(user, ...userInfoSelectFields));

export const mockApplication: Application = {
  id: 'foo',
  name: 'foo',
  type: ApplicationType.SPA,
  description: null,
  oidcClientMetadata: {
    redirectUris: [],
    postLogoutRedirectUris: [],
  },
  customClientMetadata: {},
  createdAt: 1_645_334_775_356,
};

export const mockResource: Resource = {
  id: 'logto_api',
  name: 'management api',
  indicator: 'logto.dev/api',
  accessTokenTtl: 3600,
};

export const mockScope: ResourceScope = {
  id: 'foo',
  name: 'read:user',
  description: 'read:user',
  resourceId: 'logto_api',
};

export const mockRole: Role = {
  name: 'admin',
  description: 'admin',
};

export const mockSetting: Setting = {
  id: 'foo setting',
  customDomain: 'mock-logto.dev',
  adminConsole: {
    applicationSkipGetStarted: false,
  },
};

export const mockSignInExperience: SignInExperience = {
  id: 'foo',
  companyInfo: {
    name: 'logto',
    logo: 'http://logto.png',
  },
  branding: {
    primaryColor: '#000',
    backgroundColor: '#fff',
    darkMode: true,
    darkBackgroundColor: '#000',
    darkPrimaryColor: '#fff',
    style: BrandingStyle.CompanyLogo_AppLogo_CompanyName_AppName,
  },
  termsOfUse: {
    enabled: false,
  },
  forgetPasswordEnabled: true,
  localization: {
    autoDetect: true,
    primaryLanguage: Language.chinese,
    fallbackLanguage: Language.english,
  },
  signInMethods: {
    primary: ['email'],
    secondary: [],
    disabled: [],
  },
};

export const mockConnector: Connector = {
  id: 'foo',
  enabled: true,
  config: {},
  createdAt: 1_645_334_775_356,
};

export const mockPasscode: Passcode = {
  id: 'foo',
  interactionJti: 'jti',
  phone: '888 888 8888',
  email: 'foo@logto.io',
  type: PasscodeType.SignIn,
  code: 'asdfghjkl',
  consumed: false,
  tryCount: 2,
  createdAt: 10,
};

export const mockUserLog: UserLog = {
  id: 'foo',
  userId: 'foo',
  type: UserLogType.RegisterEmail,
  result: UserLogResult.Success,
  payload: {},
  createdAt: 10,
};
