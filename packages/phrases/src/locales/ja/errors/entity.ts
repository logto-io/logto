const entity = {
  invalid_input: '入力が無効です。値のリストは空であってはなりません。',
  value_too_long: '値の長さが長すぎて、制限を超えています。',
  create_failed: '{{name}}の作成に失敗しました。',
  db_constraint_violated: 'データベースの制約が違反しました。',
  not_exists: '{{name}}は存在しません。',
  not_exists_with_id: 'IDが`{{id}}`の{{name}}は存在しません。',
  not_found: 'リソースが存在しません。',
  relation_foreign_key_not_found:
    '外部キーが1つ以上見つかりません。入力を確認し、すべての参照先エンティティが存在することを確認してください。',
  unique_integrity_violation:
    'エンティティは既に存在します。入力を確認してもう一度お試しください。',
};

export default Object.freeze(entity);
