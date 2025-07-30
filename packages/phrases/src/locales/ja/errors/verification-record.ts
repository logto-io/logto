const verification_record = {
  not_found: '検証レコードが見つかりません。',
  permission_denied: '許可が拒否されましたので、再認証してください。',
  not_supported_for_google_one_tap: 'この API は Google One Tap をサポートしていません。',
  social_verification: {
    invalid_target:
      '無効な検証レコードです。{{expected}} を期待しましたが、{{actual}} が返されました。',
    token_response_not_found:
      'トークン応答が見つかりません。ソーシャルコネクタのトークンストレージがサポートされており、有効になっていることを確認してください。',
  },
};

export default Object.freeze(verification_record);
