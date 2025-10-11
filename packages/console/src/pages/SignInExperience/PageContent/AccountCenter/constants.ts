import type { AdminConsoleKey } from '@logto/phrases';

import type { AccountCenterFieldKey } from '../../types';

export type AccountCenterFieldItem = {
  readonly key: AccountCenterFieldKey;
  readonly title: AdminConsoleKey;
  readonly description?: AdminConsoleKey;
};

type AccountCenterFieldGroup = {
  readonly key: string;
  readonly title: AdminConsoleKey;
  readonly items: readonly AccountCenterFieldItem[];
};

type AccountCenterFieldSection = {
  readonly key: string;
  readonly title: AdminConsoleKey;
  readonly description: AdminConsoleKey;
  readonly groups: readonly AccountCenterFieldGroup[];
};

export const accountCenterSections: AccountCenterFieldSection[] = [
  {
    key: 'accountSecurity',
    title: 'sign_in_exp.account_center.sections.account_security.title',
    description: 'sign_in_exp.account_center.sections.account_security.description',
    groups: [
      {
        key: 'identifiers',
        title: 'sign_in_exp.account_center.sections.account_security.groups.identifiers.title',
        items: [
          { key: 'email', title: 'sign_in_exp.account_center.fields.email' },
          { key: 'phone', title: 'sign_in_exp.account_center.fields.phone' },
          { key: 'social', title: 'sign_in_exp.account_center.fields.social' },
        ],
      },
      {
        key: 'authentication',
        title:
          'sign_in_exp.account_center.sections.account_security.groups.authentication_factors.title',
        items: [
          { key: 'password', title: 'sign_in_exp.account_center.fields.password' },
          {
            key: 'mfa',
            title: 'sign_in_exp.account_center.fields.mfa',
          },
        ],
      },
    ],
  },
  {
    key: 'userProfile',
    title: 'sign_in_exp.account_center.sections.user_profile.title',
    description: 'sign_in_exp.account_center.sections.user_profile.description',
    groups: [
      {
        key: 'profileData',
        title: 'sign_in_exp.account_center.sections.user_profile.groups.profile_data.title',
        items: [
          { key: 'username', title: 'sign_in_exp.account_center.fields.username' },
          { key: 'name', title: 'sign_in_exp.account_center.fields.name' },
          { key: 'avatar', title: 'sign_in_exp.account_center.fields.avatar' },
          {
            key: 'profile',
            title: 'sign_in_exp.account_center.fields.profile',
          },
          {
            key: 'customData',
            title: 'sign_in_exp.account_center.fields.custom_data',
          },
        ],
      },
    ],
  },
];
