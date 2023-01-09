const user_details = {
  back_to_users: 'Back to User Management',
  created_title: 'This user has been successfully created',
  created_guide: 'You can send the following log in information to the user',
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
  settings: 'Settings',
  settings_description:
    'Each user has a profile containing all user information. It consists of basic data, social identities, and custom data.',
  field_email: 'Primary email',
  field_phone: 'Primary phone',
  field_username: 'Username',
  field_name: 'Name',
  field_avatar: 'Avatar image URL',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Custom data',
  field_custom_data_tip:
    'Additional user info not listed in the pre-defined user properties, such as user-preferred color and language.',
  field_connectors: 'Social connections',
  custom_data_invalid: 'Custom data must be a valid JSON object',
  connectors: {
    connectors: 'Connectors',
    user_id: 'User ID',
    remove: 'Remove',
    not_connected: 'The user is not connected to any social connector',
    deletion_confirmation:
      'You are removing the existing <name/> identity. Are you sure you want to do that?',
  },
  suspended: 'Suspended',
  roles: {
    name_column: 'Role',
    description_column: 'Description',
    assign_button: 'Assign Roles',
    delete_description: 'TBD', // UNTRANSLATED
    deleted: 'The role {{name}} has been successfully deleted from the user.', // UNTRANSLATED
  },
};

export default user_details;
