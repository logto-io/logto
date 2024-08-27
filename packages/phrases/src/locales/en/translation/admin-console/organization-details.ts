const organization_details = {
  page_title: 'Organization details',
  delete_confirmation:
    'Once deleted, all members will lose their membership and roles in this organization. This action cannot be undone.',
  organization_id: 'Organization ID',
  settings_description:
    'Organizations represent the teams, business customers, and partner companies that can access your applications.',
  name_placeholder: 'The name of the organization, not required to be unique.',
  description_placeholder: 'A description of the organization.',
  member: 'Member',
  member_other: 'Members',
  add_members_to_organization: 'Add members to organization {{name}}',
  add_members_to_organization_description:
    'Find appropriate users by searching name, email, phone, or user ID. Existing members are not shown in the search results.',
  add_with_organization_role: 'Add with organization role(s)',
  user: 'User',
  application: 'Application',
  application_other: 'Applications',
  add_applications_to_organization: 'Add applications to organization {{name}}',
  add_applications_to_organization_description:
    'Find appropriate applications by searching app ID, name, or description. Existing applications are not shown in the search results.',
  at_least_one_application: 'At least one application is required.',
  remove_application_from_organization: 'Remove application from organization',
  remove_application_from_organization_description:
    'Once removed, the application will lose its association and roles in this organization. This action cannot be undone.',
  search_application_placeholder: 'Search by app ID, name, or description',
  roles: 'Organization roles',
  authorize_to_roles: 'Authorize {{name}} to access the following roles:',
  edit_organization_roles: 'Edit organization roles',
  edit_organization_roles_title: 'Edit organization roles of {{name}}',
  remove_user_from_organization: 'Remove user from organization',
  remove_user_from_organization_description:
    'Once removed, the user will lose their membership and roles in this organization. This action cannot be undone.',
  search_user_placeholder: 'Search by name, email, phone or user ID',
  at_least_one_user: 'At least one user is required.',
  organization_roles_tooltip: 'The roles assigned to the {{type}} within this organization.',
  custom_data: 'Custom data',
  custom_data_tip:
    'Custom data is a JSON object that can be used to store additional data associated with the organization.',
  invalid_json_object: 'Invalid JSON object.',
  branding: {
    logo: 'Organization logos',
    logo_tooltip:
      'You can pass the organization ID to display this logo in the sign-in experience; the dark version of the logo is needed if dark mode is enabled in the omni sign-in experience settings. <a>Learn more</a>',
  },
  jit: {
    title: 'Just-in-time provisioning',
    description:
      'Users can automatically join the organization and be assigned roles upon their first sign-in through some authentication methods. You can set requirements to meet for just-in-time provisioning.',
    email_domain: 'Email domain provisioning',
    email_domain_description:
      'New users signing up with their verified email addresses or through social sign-in with verified email addresses will automatically join the organization. <a>Learn more</a>',
    email_domain_placeholder: 'Enter email domains for just-in-time provisioning',
    invalid_domain: 'Invalid domain',
    domain_already_added: 'Domain already added',
    sso_enabled_domain_warning:
      'You have entered one or more email domains associated to enterprise SSO. Users with these emails will follow the standard SSO flow and won’t be provisioned to this organization unless enterprise SSO provisioning is configured.',
    enterprise_sso: 'Enterprise SSO provisioning',
    no_enterprise_connector_set:
      'You haven’t set up any enterprise SSO connector yet. Add connectors first to enable enterprise SSO provisioning. <a>Set up</a>',
    add_enterprise_connector: 'Add enterprise connector',
    enterprise_sso_description:
      'New users or existing users signing in through enterprise SSO for the first time will automatically join the organization. <a>Learn more</a>',
    organization_roles: 'Default organization roles',
    organization_roles_description:
      'Assign roles to users upon joining the organization through just-in-time provisioning.',
  },
  mfa: {
    title: 'Multi-factor authentication (MFA)',
    tip: 'When MFA is required, users with no MFA configured will be rejected when trying to exchange an organization token. This setting does not affect user authentication.',
    description:
      'Require users to configure multi-factor authentication to access this organization.',
    no_mfa_warning:
      'No multi-factor authentication methods are enabled for your tenant. Users will not be able to access this organization until at least one <a>multi-factor authentication method</a> is enabled.',
  },
};

export default Object.freeze(organization_details);
