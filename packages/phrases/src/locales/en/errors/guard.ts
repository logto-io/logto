const guard = {
  invalid_input: 'The request {{type}} is invalid.',
  invalid_pagination: 'The request pagination value is invalid.',
  can_not_get_tenant_id: 'Unable to get tenant id from request.',
  file_size_exceeded: 'File size exceeded.',
  mime_type_not_allowed: 'MIME type is not allowed.',
  not_allowed_for_admin_tenant: 'Not allowed for admin tenant.',
};

export default Object.freeze(guard);
