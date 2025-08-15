const custom_profile_fields = {
  entity_not_exists_with_names: 'Cannot find entities with the given names: {{names}}',
  invalid_min_max_input: 'Invalid min and max input.',
  invalid_default_value: 'Invalid default value.',
  invalid_options: 'Invalid field options.',
  invalid_regex_format: 'Invalid regex format.',
  invalid_address_components: 'Invalid address components.',
  invalid_fullname_components: 'Invalid fullname components.',
  invalid_sub_component_type: 'Invalid sub-component type.',
  name_exists: 'Field already exists with the given name.',
  conflicted_sie_order: 'Conflicted field order value for Sign-in Experience.',
  invalid_name: 'Invalid field name, only letters or numbers are allowed, case sensitive.',
  name_conflict_sign_in_identifier:
    'Invalid field name. Reserved sign-in identifier key(s): {{name}}.',
  name_conflict_built_in_prop:
    'Invalid field name. Reserved built-in user profile property name(s): {{name}}.',
  name_conflict_custom_data: 'Invalid field name. Reserved custom data key(s): {{name}}.',
  name_required: 'Field name is required.',
};

export default Object.freeze(custom_profile_fields);
