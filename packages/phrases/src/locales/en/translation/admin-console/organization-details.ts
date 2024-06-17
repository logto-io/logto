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
  authorize_to_roles: 'Authorize {{name}} to access the following roles:',
  edit_organization_roles: 'Edit organization roles',
  edit_organization_roles_of_user: 'Edit organization roles of {{name}}',
  remove_user_from_organization: 'Remove user from organization',
  remove_user_from_organization_description:
    'Once removed, the user will lose their membership and roles in this organization. This action cannot be undone.',
  search_user_placeholder: 'Search by name, email, phone or user ID',
  at_least_one_user: 'At least one user is required.',
  custom_data: 'Custom data',
  custom_data_tip:
    'Custom data is a JSON object that can be used to store additional data associated with the organization.',
  invalid_json_object: 'Invalid JSON object.',
  membership_policies: 'Membership policies',
  membership_policies_description:
    'Define how users can join this organization and what requirements they must meet for access.',
  jit: {
    title: 'Enable just-in-time provisioning',
    description:
      'Users can automatically join the organization and receive role assignments if their email matches specific domains, either during sign-up or when added via the Management API.',
    email_domains: 'JIT provisioning email domains',
    email_domains_placeholder: 'Enter email domains for just-in-time provisioning',
    invalid_domain: 'Invalid domain',
    domain_already_added: 'Domain already added',
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
      'No multi-factor authentication methods are enabled for your tenant. Users will not be able to access this organization until at least one multi-factor authentication method is enabled.',
  },
};

export default Object.freeze(organization_details);
