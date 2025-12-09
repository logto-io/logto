const entity = {
  invalid_input: '無效輸入。值列表不能為空。',
  value_too_long: '值長度過長，超過了限制。',
  create_failed: '創建 {{name}} 失敗。',
  db_constraint_violated: '數據庫約束違反。',
  not_exists: '該 {{name}} 不存在。',
  not_exists_with_id: 'ID 為 `{{id}}` 的 {{name}} 不存在。',
  not_found: '該資源不存在。',
  relation_foreign_key_not_found: '找不到一個或多個外鍵。請檢查輸入並確保所有參照的實體都存在。',
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);
