const entity = {
  invalid_input: '無效輸入。值列表不能為空。',
  create_failed: '創建 {{name}} 失敗。',
  db_constraint_violated: '數據庫約束違反。',
  not_exists: '該 {{name}} 不存在。',
  not_exists_with_id: 'ID 為 `{{id}}` 的 {{name}} 不存在。',
  not_found: '該資源不存在。',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  duplicate_value_of_unique_field: 'The value of the unique field `{{field}}` is duplicated.',
};

export default Object.freeze(entity);
