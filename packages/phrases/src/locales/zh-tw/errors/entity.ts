const entity = {
  invalid_input: '無效的輸入。值列表不能為空。',
  create_failed: '建立 {{name}} 失敗。',
  db_constraint_violated: '數據庫限制違反。',
  not_exists: '{{name}} 不存在。',
  not_exists_with_id: 'ID 為 `{{id}}` 的 {{name}} 不存在。',
  not_found: '資源不存在。',
};

export default Object.freeze(entity);
