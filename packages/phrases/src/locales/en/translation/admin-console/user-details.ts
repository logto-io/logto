const user_details = {
  page_title: 'User details',
  back_to_users: 'Back to user management',
  created_title: 'This user has been successfully created',
  created_guide: 'Here’s the information to assist the user with their sign-in process.',
  created_email: 'Email address:',
  created_phone: 'Phone number:',
  created_username: 'Username:',
  created_password: 'Password:',
  menu_delete: 'Delete',
  delete_description: 'This action cannot be undone. It will permanently delete the user.',
  deleted: 'The user has been successfully deleted',
  reset_password: {
    reset_password: 'Reset password',
    title: 'Are you sure you want to reset the password?',
    content: "This action cannot be undone. This will reset the user's log in information.",
    congratulations: 'This user has been reset',
    new_password: 'New password:',
  },
  tab_settings: 'Settings',
  tab_roles: 'Roles',
  tab_logs: 'User logs',
  tab_organizations: 'Organizations',
  authentication: 'Authentication',
  authentication_description:
    'Each user has a profile containing all user information. It consists of basic data, social identities, and custom data.',
  user_profile: 'User data',
  field_email: 'Email address',
  field_phone: 'Phone number',
  field_username: 'Username',
  field_name: 'Name',
  field_avatar: 'Avatar image URL',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Custom data',
  field_custom_data_tip:
    'Additional user info not listed in the pre-defined user properties, such as user-preferred color and language.',
  field_profile: 'Profile',
  field_profile_tip:
    "Additional OpenID Connect standard claims that are not included in user's properties. Note that all unknown properties will be stripped. Please refer to <a>profile property reference</a> for more information.",
  field_connectors: 'Social connections',
  field_sso_connectors: 'Enterprise connections',
  custom_data_invalid: 'Custom data must be a valid JSON object',
  profile_invalid: 'Profile must be a valid JSON object',
  connectors: {
    connectors: 'Connectors',
    user_id: 'User ID',
    remove: 'Remove',
    connected: 'This user is connected with multiple social connectors.',
    not_connected: 'The user is not connected to any social connector',
    deletion_confirmation:
      'You are removing the existing <name/> identity. Are you sure you want to continue?',
  },
  sso_connectors: {
    connectors: 'Connectors',
    enterprise_id: 'Enterprise ID',
    connected:
      'This user is connected to multiple enterprise identity providers for Single Sign-On.',
    not_connected:
      'The user is not connected to any enterprise identity providers for Single Sign-On.',
  },
  mfa: {
    field_name: 'Multi-factor authentication',
    field_description: 'This user has enabled 2-step verification factors.',
    name_column: 'Multi-Factor',
    field_description_empty: 'This user has not enabled 2-step verification factors.',
    deletion_confirmation:
      'You are removing the existing <name/> for the 2-step verification. Are you sure you want to continue?',
  },
  suspended: 'Suspended',
  suspend_user: 'Suspend user',
  suspend_user_reminder:
    'Are you sure you want to suspend this user? The user will be unable to sign in to your app and won’t be able to obtain a new access token after the current one expires. Additionally, any API requests made by this user will fail.',
  suspend_action: 'Suspend',
  user_suspended: 'User has been suspended.',
  reactivate_user: 'Reactivate user',
  reactivate_user_reminder:
    'Are you sure you want to reactivate this user? Doing so will permit any sign-in attempts for this user.',
  reactivate_action: 'Reactivate',
  user_reactivated: 'User has been reactivated.',
  roles: {
    name_column: 'User role',
    description_column: 'Description',
    assign_button: 'Assign roles',
    delete_description:
      'This action will remove this role from this user. The role itself will still exist, but it will no longer be associated with this user.',
    deleted: '{{name}} was successfully removed from this user.',
    assign_title: 'Assign roles to {{name}}',
    assign_subtitle: 'Find appropriate user roles by by searching name, description or role ID.',
    assign_role_field: 'Assign roles',
    role_search_placeholder: 'Search by role name',
    added_text: '{{value, number}} added',
    assigned_user_count: '{{value, number}} users',
    confirm_assign: 'Assign roles',
    role_assigned: 'Successfully assigned role(s)',
    search: 'Search by role name, description or ID',
    empty: 'No role available',
  },
  warning_no_sign_in_identifier:
    'User needs to have at least one of the sign-in identifiers (username, email, phone number or social) to sign in. Are you sure you want to continue?',
};

export default Object.freeze(user_details);
