const concurrent_device_limit = {
  title: '同時設備限制',
  description: '控制每個用戶可以在多少設備上保持登入此應用程式。',
  enable: '啟用同時設備限制',
  enable_description: '啟用後，Logto 將對此應用程式的每位用戶強制執行最大活動授權數量。',
  field: '每個應用程式的同時設備限制',
  field_description:
    '限制用戶可同時登入的設備數量。Logto 通過限制活動授權來強制執行此操作，並在超過限制時自動撤銷最舊的授權。',
  field_placeholder: '保持空白則無限制',
  should_be_greater_than_zero: '應大於 0。',
};

export default Object.freeze(concurrent_device_limit);
