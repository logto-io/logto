import { UserScope } from '@logto/core-kit';

const user_scopes = {
  descriptions: {
    [UserScope.CustomData]: 'Your custom data',
    [UserScope.Email]: 'Your email address',
    [UserScope.Phone]: 'Your phone number',
    [UserScope.Profile]: 'Your name, username and avatar',
    [UserScope.Roles]: 'Your roles',
    [UserScope.Identities]: 'Your linked social identities',
    [UserScope.Organizations]: 'Your organizations info',
    [UserScope.OrganizationRoles]: 'Your organization roles',
  },
};

export default Object.freeze(user_scopes);
