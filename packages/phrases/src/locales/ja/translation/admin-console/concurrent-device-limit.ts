const concurrent_device_limit = {
  title: '同時デバイス制限',
  description: '各ユーザーがこのアプリでサインインできるデバイスの数を制御します。',
  enable: '同時デバイス制限を有効にする',
  enable_description:
    '有効にすると、Logto はこのアプリに対するユーザーごとの最大アクティブグラント数を制限します。',
  field: 'アプリごとの同時デバイス制限',
  field_description:
    'ユーザーが同時にサインインできるデバイスの数を制限します。Logto はアクティブなグラントを制限し、上限を超えた場合は最も古いグラントを自動的に無効にします。',
  field_placeholder: '無制限の場合は空白のままにしてください',
  should_be_greater_than_zero: '0 より大きくする必要があります。',
};

export default Object.freeze(concurrent_device_limit);
