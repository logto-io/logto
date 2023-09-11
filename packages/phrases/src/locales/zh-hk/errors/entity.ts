const entity = {
  invalid_input: '無效輸入。值列表不能為空。',
  create_failed: '創建 {{name}} 失敗。',
  db_constraint_violated: '數據庫約束違反。',
  not_exists: '該 {{name}} 不存在。',
  not_exists_with_id: 'ID 為 `{{id}}` 的 {{name}} 不存在。',
  not_found: '該資源不存在。',
};

export default Object.freeze(entity);
