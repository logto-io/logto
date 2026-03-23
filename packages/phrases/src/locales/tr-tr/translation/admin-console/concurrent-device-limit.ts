const concurrent_device_limit = {
  title: 'Eşzamanlı cihaz sınırı',
  description: 'Her kullanıcının bu uygulamada kaç cihazda oturum açabileceğini kontrol edin.',
  enable: 'Eşzamanlı cihaz sınırını etkinleştir',
  enable_description:
    'Etkinleştirildiğinde, Logto bu uygulama için kullanıcı başına maksimum aktif izinleri zorlar.',
  field: 'Uygulama başına eşzamanlı cihaz sınırı',
  field_description:
    'Bir kullanıcının aynı anda kaç cihazda oturum açabileceğini sınırlayın. Logto, aktif izinleri sınırlayarak bunu zorlar ve sınır aşıldığında en eski izni otomatik olarak iptal eder.',
  field_placeholder: 'Sınırlama olmaması için boş bırakın',
  should_be_greater_than_zero: "0'dan büyük olmalıdır.",
};

export default Object.freeze(concurrent_device_limit);
