const jwt_claims = {
  title: 'カスタムJWT',
  description:
    'アクセストークンまたはIDトークンをカスタマイズして、アプリケーションに追加情報を提供します。',
  access_token: {
    card_title: 'アクセストークン',
    card_description:
      'アクセストークンは、APIがリクエストを承認するために使用する資格情報であり、アクセス決定に必要なクレームのみを含みます。',
  },
  user_jwt: {
    card_field: 'ユーザーアクセストークン',
    card_description: 'アクセストークン発行時にユーザー固有のデータを追加します。',
    for: 'ユーザー向け',
  },
  machine_to_machine_jwt: {
    card_field: 'マシン対マシンアクセストークン',
    card_description: 'マシン対マシントークン発行時に追加データを含めます。',
    for: 'M2M向け',
  },
  id_token: {
    card_title: 'IDトークン',
    card_description:
      'IDトークンはサインイン後に受け取る身元証明であり、クライアントが表示またはセッション作成に使用するユーザー識別クレームを含みます。',
    card_field: 'ユーザーIDトークン',
    card_field_description:
      "クレーム 'sub'、'email'、'phone'、'profile'、'address' は常に利用可能です。その他のクレームはここで先に有効にする必要があります。すべての場合において、アプリは統合時に一致するスコープをリクエストして受信する必要があります。",
  },
  code_editor_title: 'カスタマイズ{{token}}クレーム',
  custom_jwt_create_button: 'カスタムクレームを追加',
  custom_jwt_item: 'カスタムクレーム{{for}}',
  delete_modal_title: 'カスタムクレームを削除',
  delete_modal_content: 'カスタムクレームを削除してもよろしいですか？',
  clear: 'クリア',
  cleared: 'クリアされた',
  restore: 'デフォルトに戻す',
  restored: '復元されました',
  data_source_tab: 'データソース',
  error_handling_tab: 'エラーハンドリング',
  test_tab: 'コンテキストをテスト',
  jwt_claims_description: 'デフォルトクレームはJWTに自動的に含まれ、オーバーライドできません。',
  user_data: {
    title: 'ユーザーデータ',
    subtitle: '`context.user`入力パラメータを使用して重要なユーザー情報を提供します。',
  },
  grant_data: {
    title: 'グラントデータ',
    subtitle:
      '`context.grant`入力パラメータを使用して重要なグラント情報を提供します。これはトークン交換のためにのみ使用できます。',
  },
  interaction_data: {
    title: 'ユーザーインタラクションコンテキスト',
    subtitle:
      '`context.interaction` パラメーターを使用して、現在の認証セッションにおけるユーザーのインタラクション詳細にアクセスします。',
  },
  application_data: {
    title: 'アプリケーションコンテキスト',
    subtitle:
      '`context.application` 入力パラメータを使用して、トークンに関連するアプリケーション情報を提供します。',
  },
  organization_data: {
    title: '組織コンテキスト',
    subtitle:
      '`context.organization` 入力パラメータを使用して、対象組織の情報を提供します。組織トークンでのみ利用可能です。',
  },
  token_data: {
    title: 'トークンデータ',
    subtitle: '現在のアクセストークンペイロードに対して`token`入力パラメータを使用します。',
  },
  api_context: {
    title: 'API コンテキスト：アクセス制御',
    subtitle: '`api.denyAccess` メソッドを使用してトークンリクエストを拒否します。',
  },
  cryptographic_capability: {
    title: 'API コンテキスト：暗号化',
    subtitle: '`api.crypto.sha256` と `api.crypto.hmacSha256` で UTF-8 ハッシュを計算します。',
    description:
      '両メソッドは非同期で、64 文字の小文字十六進文字列の Promise を返します。入力は Unicode 正規化なしで UTF-8 エンコードされます。`sha256(input)` は SHA-256(UTF-8(input))、`hmacSha256({ key, input })` は HMAC-SHA-256(UTF-8(key), UTF-8(input)) を計算します。HMAC キーは環境変数から読み取り、自分で `.trim()` し、空なら呼び出さないでください。メソッドは trim も SHA-256 へのフォールバックもしません。空白を含まない高エントロピーのキーを推奨します。空のメッセージは有効、空のキーは無効です。入力は最大 1 MiB UTF-8、HMAC キーは最大 64 KiB です。SHA-256 はメールや電話番号などの列挙可能な識別子を隠しません。秘密鍵付きの安定 ID には HMAC を使ってください。どちらもパスワード保存には向きません。環境変数は Custom JWT 管理者と実行ランナーから見え、マネージドキーシステムではありません。HMAC キーのローテーションはすべての派生値を変えます。移行が必要ならアプリ定義のキーバージョンと二重値期間を自分で実装してください。複数値は呼び出し側が明確な直列化を定義する必要があります（同一ランタイムでは `JSON.stringify([value1, value2])` が簡単な例）。言語横断では独自の正準形式に合意してください。セルフホストの Logto では、このスクリプトはサンドボックス警告の信頼済みスクリプトモデルのままです。',
  },
  error_handling: {
    title: 'エラーハンドリング',
    subtitle: 'スクリプトが失敗したときにトークン発行をブロックするかどうかを制御します。',
    input_field_title: 'スクリプトエラー時のトークン発行動作',
    block_issuance_switch: 'スクリプトがエラーになった場合はトークン発行をブロックする',
    default_hint_create:
      '新しいカスタムクレームスクリプトでは、スクリプトが失敗した場合にトークン発行をブロックする設定がデフォルトで有効になります。API がすでに値を返している場合は、保存済みの値が優先されます。',
    default_hint_edit:
      'この設定を持たない既存のカスタムクレームスクリプトでは、明示的に値を保存するまで、従来どおりデフォルトで無効のままになります。',
    warning:
      '有効にすると、スクリプト実行時エラーによりトークンリクエストは `invalid_request` (400) とローカライズされた `error_description` で拒否されます。`api.denyAccess` の呼び出しは引き続き `access_denied` を返します。',
  },
  fetch_external_data: {
    title: '外部データを取得',
    subtitle: '外部APIからデータを直接クレームに組み込みます。',
    description: '`fetch`関数を使用して外部APIを呼び出し、データをカスタムクレームに含めます。例：',
  },
  environment_variables: {
    title: '環境変数を設定',
    subtitle: '機密情報を保存するために環境変数を使用します。',
    input_field_title: '環境変数を追加',
    sample_code: 'カスタムJWTクレームハンドラで環境変数にアクセスする方法。例：',
  },
  jwt_claims_hint:
    'カスタムクレームの制限は50KB未満です。デフォルトのJWTクレームは自動的にトークンに含まれ、オーバーライドできません。',
  tester: {
    subtitle: 'テストのためにモックトークンとユーザーデータを調整します。',
    run_button: 'テストを実行',
    result_title: 'テスト結果',
  },
  sandbox_warning: {
    title: 'スクリプトはサーバー権限で実行されます',
    description:
      'セルフホスト版 Logto では、このスクリプトは Logto 本体と同じ環境で実行されます。サーバーの環境変数を読み取り、内部ネットワーク上のサービスに到達できます。サンドボックス化されていません。サーバーへのアクセスを許可してもよい相手にのみ、このページへのアクセスを付与してください。',
  },
  form_error: {
    invalid_json: '無効なJSON形式',
  },
};

export default Object.freeze(jwt_claims);
