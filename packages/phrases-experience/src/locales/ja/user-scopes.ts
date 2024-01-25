import { UserScope } from '@logto/core-kit';

const user_scopes = {
  descriptions: {
    /** UNTRANSLATED */
    [UserScope.CustomData]: 'Your custom data',
    /** UNTRANSLATED */
    [UserScope.Email]: 'Your email address',
    /** UNTRANSLATED */
    [UserScope.Phone]: 'Your phone number',
    /** UNTRANSLATED */
    [UserScope.Profile]: 'Your name and avatar',
    /** UNTRANSLATED */
    [UserScope.Roles]: 'Your roles',
    /** UNTRANSLATED */
    [UserScope.Identities]: 'Your linked social identities',
    /** UNTRANSLATED */
    [UserScope.Organizations]: 'Your organizations info',
    /** UNTRANSLATED */
    [UserScope.OrganizationRoles]: 'Your organization roles',
  },
};

export default Object.freeze(user_scopes);
