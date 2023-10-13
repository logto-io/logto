const entity = {
  invalid_input: '无效输入。值列表不能为空。',
  create_failed: '创建 {{name}} 失败。',
  db_constraint_violated: '数据库约束被破坏。',
  not_exists: '该 {{name}} 不存在。',
  not_exists_with_id: 'ID 为 `{{id}}` 的 {{name}} 不存在。',
  not_found: '该资源不存在。',
  /** UNTRANSLATED */
  duplicate_value_of_unique_field: 'The value of the unique field `{{field}}` is duplicated.',
};

export default Object.freeze(entity);
