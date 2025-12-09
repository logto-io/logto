const entity = {
  invalid_input: '无效输入。值列表不能为空。',
  value_too_long: '值长度过长，超过了限制。',
  create_failed: '创建 {{name}} 失败。',
  db_constraint_violated: '数据库约束被破坏。',
  not_exists: '该 {{name}} 不存在。',
  not_exists_with_id: 'ID 为 `{{id}}` 的 {{name}} 不存在。',
  not_found: '该资源不存在。',
  relation_foreign_key_not_found:
    '无法找到一个或多个外键。请检查输入，并确保所有引用的实体都存在。',
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);
