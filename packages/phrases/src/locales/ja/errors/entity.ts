const entity = {
  invalid_input: '入力が無効です。値のリストは空であってはなりません。',
  create_failed: '{{name}}の作成に失敗しました。',
  db_constraint_violated: 'データベースの制約が違反しました。',
  not_exists: '{{name}}は存在しません。',
  not_exists_with_id: 'IDが`{{id}}`の{{name}}は存在しません。',
  not_found: 'リソースが存在しません。',
};

export default Object.freeze(entity);
