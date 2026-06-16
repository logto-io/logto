const request = {
  invalid_input: '輸入無效。{{details}}',
  general: '發生請求錯誤。',
  range_not_satisfiable: '範圍不滿足。',
  feature_not_supported: '當前環境不支援此功能。',
  rate_limited: '請求過於頻繁，請稍後再試。',
};

export default Object.freeze(request);
