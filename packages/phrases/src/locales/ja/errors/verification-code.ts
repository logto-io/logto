const verification_code = {
  phone_email_empty: '電話番号とEメールの両方が空です。',
  not_found: '検証コードが見つかりません。先に検証コードを送信してください。',
  phone_mismatch: '電話番号が一致しません。新しい検証コードをリクエストしてください。',
  email_mismatch: 'Eメールが一致しません。新しい検証コードをリクエストしてください。',
  code_mismatch: '無効な検証コードです。',
  expired: '検証コードの有効期限が切れました。新しい検証コードをリクエストしてください。',
  exceed_max_try:
    '検証コードのリトライ上限を超えました。新しい検証コードをリクエストしてください。',
};

export default verification_code;
