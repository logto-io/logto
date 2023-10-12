const entity = {
  invalid_input: 'Invalid input. Value list must not be empty.',
  create_failed: 'Failed to create {{name}}.',
  db_constraint_violated: 'Database constraint violated.',
  not_exists: 'The {{name}} does not exist.',
  not_exists_with_id: 'The {{name}} with ID `{{id}}` does not exist.',
  not_found: 'The resource does not exist.',
  duplicate_value_of_unique_field: 'The value of the unique field `{{field}}` is duplicated.',
};

export default Object.freeze(entity);
