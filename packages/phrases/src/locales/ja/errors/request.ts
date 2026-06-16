const request = {
  invalid_input: '入力が無効です。 {{details}}',
  general: 'リクエストエラーが発生しました。',
  range_not_satisfiable: '要求範囲が満たされません。',
  feature_not_supported: 'この機能は現在の環境ではサポートされていません。',
  rate_limited: 'リクエストが多すぎます。しばらくしてからもう一度お試しください。',
};

export default Object.freeze(request);
