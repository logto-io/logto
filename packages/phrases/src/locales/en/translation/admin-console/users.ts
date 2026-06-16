const users = {
  page_title: 'User management',
  title: 'User management',
  subtitle:
    'Manage user identities including creating users, editing user information, viewing user logs, password resets and deleting users.',
  create: 'Add user',
  import_csv: 'Import CSV',
  import_csv_subtitle: 'Upload a CSV file to import multiple users at once.',
  import_csv_select_file: 'Select CSV file',
  import_csv_selected_file: 'Selected file: {{filename}}',
  import_csv_no_file: 'No file selected.',
  import_csv_importing: 'Importing users...',
  import_csv_progress: 'Imported {{current}} of {{total}} users',
  import_csv_finished: 'Import finished. {{success}} succeeded, {{failed}} failed.',
  import_csv_start: 'Start import',
  create_subtitle: 'Provide at least one of the following fields to proceed.',
  error_missing_identifier: 'You must provide at least one identifier to create a user.',
  user_name: 'User',
  application_name: 'From application',
  latest_sign_in: 'Latest sign in',
  create_form_username: 'Username',
  create_form_password: 'Password',
  create_form_name: 'Full name',
  placeholder_name: 'John/Jane Doe',
  placeholder_email: 'jdoe@example.com',
  placeholder_username: 'user123',
  placeholder_phone: '+1 (555) 555-5555',
  unnamed: 'Unnamed',
  search: 'Search by name, email, phone or username',
  check_user_detail: 'Check user detail',
  placeholder_title: 'User management',
  placeholder_description:
    'Each user has a profile containing all user information. It consists of basic data, social identities, and custom data.',
  dev_tenant_data_retention_notice:
    'In dev tenants, user accounts older than 90 days are automatically deleted. <a>Learn more</a>',
};

export default Object.freeze(users);
