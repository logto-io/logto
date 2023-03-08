const errors = {
  something_went_wrong: 'Oops! Something went wrong.',
  page_not_found: 'Page not found',
  unknown_server_error: 'Unknown server error occurred',
  empty: 'No data',
  missing_total_number: 'Unable to find Total-Number in response headers',
  invalid_uri_format: 'Invalid URI format',
  invalid_origin_format: 'Invalid URI origin format',
  invalid_json_format: 'Invalid JSON format',
  invalid_error_message_format: 'The error message format is invalid.',
  required_field_missing: 'Please enter {{field}}',
  required_field_missing_plural: 'You have to enter at least one {{field}}',
  more_details: 'More details',
  username_pattern_error:
    'Username should only contain letters, numbers, or underscore and should not start with a number.',
  password_pattern_error:
    'Password requires a minimum of {{min}} characters and contains a mix of letters, numbers, and symbols.',
  insecure_contexts: 'Insecure contexts (non-HTTPS) are not supported.',
  unexpected_error: 'An unexpected error occurred',
  not_found: '404 not found',
};

export default errors;
