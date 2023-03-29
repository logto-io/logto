const connector = {
  general: 'Error occurred in connector: {{errorDescription}}',
  not_found: 'Cannot find any available connector for type: {{type}}.',
  not_enabled: 'The connector is not enabled.',
  invalid_metadata: "The connector's metadata is invalid.",
  invalid_config_guard: "The connector's config guard is invalid.",
  unexpected_type: "The connector's type is unexpected.",
  invalid_request_parameters: 'The request is with wrong input parameter(s).',
  insufficient_request_parameters: 'The request might miss some input parameters.',
  invalid_config: "The connector's config is invalid.",
  invalid_response: "The connector's response is invalid.",
  template_not_found: 'Unable to find correct template in connector config.',
  not_implemented: '{{method}}: has not been implemented yet.',
  social_invalid_access_token: "The connector's access token is invalid.",
  invalid_auth_code: "The connector's auth code is invalid.",
  social_invalid_id_token: "The connector's id token is invalid.",
  authorization_failed: "The user's authorization process is unsuccessful.",
  social_auth_code_invalid: 'Unable to get access token, please check authorization code.',
  more_than_one_sms: 'The number of SMS connectors is larger then 1.',
  more_than_one_email: 'The number of Email connectors is larger then 1.',
  more_than_one_connector_factory:
    'Found multiple connector factories (with id {{connectorIds}}), you may uninstall unnecessary ones.',
  db_connector_type_mismatch: 'There is a connector in the DB that does not match the type.',
  not_found_with_connector_id: 'Can not find connector with given standard connector id.',
  multiple_instances_not_supported:
    'Can not create multiple instance with picked standard connector.',
  invalid_type_for_syncing_profile: 'You can only sync user profile with social connectors.',
  can_not_modify_target: "The connector 'target' can not be modified.",
  should_specify_target: "You should specify 'target'.",
  multiple_target_with_same_platform:
    'You can not have multiple social connectors that have same target and platform.',
  cannot_overwrite_metadata_for_non_standard_connector:
    "This connector's 'metadata' cannot be overwritten.",
};

export default connector;
