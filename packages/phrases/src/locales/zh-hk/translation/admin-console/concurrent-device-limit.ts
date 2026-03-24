const concurrent_device_limit = {
  title: '並行設備限制',
  enable: '啟用並行設備限制',
  enable_description: '啟用後，Logto 將對每個用戶在此應用上的最大活動授予數進行強制執行。',
  field: '每個應用的並行設備限制',
  field_description:
    '限制用戶同時登錄的設備數量。Logto 透過限制活動授予數來強制執行此限制，並在超過限制時自動撤銷最舊的授予。',
  field_placeholder: '留空表示無限制',
  should_be_greater_than_zero: '應大於 0。',
};

export default Object.freeze(concurrent_device_limit);
