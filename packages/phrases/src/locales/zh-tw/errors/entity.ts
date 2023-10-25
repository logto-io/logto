const entity = {
  invalid_input: '無效的輸入。值列表不能為空。',
  create_failed: '建立 {{name}} 失敗。',
  db_constraint_violated: '數據庫限制違反。',
  not_exists: '{{name}} 不存在。',
  not_exists_with_id: 'ID 為 `{{id}}` 的 {{name}} 不存在。',
  not_found: '資源不存在。',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);
