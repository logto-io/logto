const entity = {
  invalid_input: 'Invalid input. Value list must not be empty.',
  value_too_long: 'The length of value is too long and exceeds the limit.',
  create_failed: 'Failed to create {{name}}.',
  db_constraint_violated: 'Database constraint violated.',
  not_exists: 'The {{name}} does not exist.',
  not_exists_with_id: 'The {{name}} with ID `{{id}}` does not exist.',
  not_found: 'The resource does not exist.',
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);
