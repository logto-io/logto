const profile = {
  name: 'Name',
  avatar: 'Avatar',
  givenName: 'ชื่อจริง',
  familyName: 'นามสกุล',
  middleName: 'ชื่อกลาง',
  fullname: 'ชื่อเต็ม',
  nickname: 'ชื่อเล่น',
  preferredUsername: 'ชื่อผู้ใช้ที่ต้องการ',
  profile: 'โปรไฟล์',
  website: 'เว็บไซต์',
  gender: 'เพศ',
  birthdate: 'วันเกิด',
  zoneinfo: 'เขตเวลา',
  locale: 'ภาษา',
  address: {
    formatted: 'ที่อยู่',
    streetAddress: 'ที่อยู่ถนน',
    locality: 'เมือง',
    region: 'รัฐ/จังหวัด',
    postalCode: 'รหัสไปรษณีย์',
    country: 'ประเทศ',
  },
  gender_options: {
    female: 'หญิง',
    male: 'ชาย',
    prefer_not_to_say: 'ไม่ระบุ',
  },
  checkbox_value: {
    checked: 'ใช่',
    unchecked: 'ไม่',
  },
  avatar_upload: {
    upload: 'Upload photo',
    replace: 'Replace photo',
    remove: 'Remove',
    uploading: 'Uploading...',
    error_file_type: 'File type must be {{extensions}}.',
    error_file_size: 'File size must not exceed {{limit}}.',
    error_upload: 'Failed to upload photo. Please try again.',
  },
};

export default Object.freeze(profile);
