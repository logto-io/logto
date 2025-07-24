const profile = {
  page_title: '账户管理',
  title: '账户管理',
  description: '在这里，你可以修改账户设置和管理个人信息，以确保账户安全。',
  settings: {
    title: '账户设置',
    profile_information: '个人信息',
    avatar: '头像',
    name: '姓名',
    username: '用户名',
  },
  link_account: {
    title: '关联账户',
    email_sign_in: '邮件登录',
    email: '邮件',
    social_sign_in: '社交账号登录',
    link_email: '绑定邮箱',
    link_email_subtitle: '绑定邮箱以便登录或帮助恢复账户。',
    email_required: '邮箱不能为空',
    invalid_email: '无效的邮箱地址',
    identical_email_address: '输入的邮箱地址与当前邮箱地址相同',
    anonymous: '匿名',
  },
  password: {
    title: '密码与安全',
    password: '密码',
    password_setting: '密码设置',
    new_password: '新密码',
    confirm_password: '确认密码',
    enter_password: '输入当前密码',
    enter_password_subtitle: '为确保账户安全，在修改密码前，请先输入当前密码以通过身份验证。',
    set_password: '设置密码',
    verify_via_password: '通过密码验证',
    show_password: '显示密码',
    required: '密码不能为空',
    do_not_match: '密码不匹配，请重新输入。',
  },
  code: {
    enter_verification_code: '输入验证码',
    enter_verification_code_subtitle: '验证码已发送至 <strong>{{target}}</strong>',
    verify_via_code: '通过邮箱验证码验证',
    resend: '重新发送验证码',
    resend_countdown: '在 {{countdown}} 秒后重新发送',
  },
  delete_account: {
    title: '删除账户',
    label: '删除账户',
    description: '删除账户将会删除所有个人信息、用户数据和配置。此操作无法撤销。',
    button: '删除账户',
    p: {
      has_issue: '很遗憾听到你想要删除账户。在删除账户之前，你需要解决以下问题。',
      after_resolved: '解决问题后，你可以删除账户。如需任何帮助，请随时联系我们。',
      check_information: '很遗憾听到你想要删除账户。请在继续操作前仔细检查以下信息。',
      remove_all_data:
        '删除账户将永久删除在 Logto Cloud 中的所有个人数据。因此，请确保在操作前备份任何重要数据。',
      confirm_information: '请确认以上信息符合你的预期。删除账户后，我们将无法恢复它。',
      has_admin_role: '由于你在以下租户中拥有管理员角色，该租户将与你的账户一起被删除：',
      has_admin_role_other: '由于你在以下租户中拥有管理员角色，它们将与你的账户一起被删除：',
      quit_tenant: '你即将退出以下租户：',
      quit_tenant_other: '你即将退出以下租户：',
    },
    issues: {
      paid_plan: '以下租户有一个付费计划，请先取消订阅：',
      paid_plan_other: '以下租户有付费计划，请先取消订阅：',
      subscription_status: '以下租户有订阅状态问题：',
      subscription_status_other: '以下租户有订阅状态问题：',
      open_invoice: '以下租户有未结发票：',
      open_invoice_other: '以下租户有未结发票：',
    },
    error_occurred: '发生错误',
    error_occurred_description: '抱歉，在删除账户时发生了问题：',
    request_id: '请求 ID：{{requestId}}',
    try_again_later: '请稍后再试。如果问题仍然存在，请联系 Logto 团队并提供请求 ID。',
    final_confirmation: '最终确认',
    about_to_start_deletion: '你即将开始删除流程，此操作不能撤销。',
    permanently_delete: '永久删除',
  },
  set: '设置',
  change: '修改',
  link: '关联',
  unlink: '取消关联',
  not_set: '未设置',
  change_avatar: '修改头像',
  change_name: '修改姓名',
  change_username: '修改用户名',
  set_name: '设置姓名',
  email_changed: '已成功绑定邮箱。',
  password_changed: '已重置密码。',
  updated: '{{target}}更改成功。',
  linked: '{{target}}账号绑定成功。',
  unlinked: '{{target}}账号解绑成功。',
  email_exists_reminder: '该邮箱 {{email}} 已被其他账号绑定，请更换邮箱。',
  unlink_confirm_text: '确定解绑',
  unlink_reminder: '解绑后，用户将无法使用该 <span></span> 账号进行登录。确定要解绑吗？',
  fields: {
    /** UNTRANSLATED */
    name: 'Name',
    /** UNTRANSLATED */
    name_description:
      "The user's full name in displayable form including all name parts (e.g., “Jane Doe”).",
    /** UNTRANSLATED */
    avatar: 'Avatar',
    /** UNTRANSLATED */
    avatar_description: "URL of the user's avatar image.",
    /** UNTRANSLATED */
    familyName: 'Family name',
    /** UNTRANSLATED */
    familyName_description: 'The user\'s surname(s) or last name(s) (e.g., "Doe").',
    /** UNTRANSLATED */
    givenName: 'Given name',
    /** UNTRANSLATED */
    givenName_description: 'The user\'s given name(s) or first name(s) (e.g., "Jane").',
    /** UNTRANSLATED */
    middleName: 'Middle name',
    /** UNTRANSLATED */
    middleName_description: 'The user\'s middle name(s) (e.g., "Marie").',
    /** UNTRANSLATED */
    nickname: 'Nickname',
    /** UNTRANSLATED */
    nickname_description:
      'Casual or familiar name for the user, which may differ from their legal name.',
    /** UNTRANSLATED */
    preferredUsername: 'Preferred username',
    /** UNTRANSLATED */
    preferredUsername_description:
      'Shorthand identifier by which the user wishes to be referenced.',
    /** UNTRANSLATED */
    profile: 'Profile',
    /** UNTRANSLATED */
    profile_description:
      "URL of the user's human-readable profile page (e.g., social media profile).",
    /** UNTRANSLATED */
    website: 'Website',
    /** UNTRANSLATED */
    website_description: "URL of the user's personal website or blog.",
    /** UNTRANSLATED */
    gender: 'Gender',
    /** UNTRANSLATED */
    gender_description: 'The user\'s self-identified gender (e.g., "Female", "Male", "Non-binary")',
    /** UNTRANSLATED */
    birthdate: 'Birthdate',
    /** UNTRANSLATED */
    birthdate_description: 'The user\'s date of birth in a specified format (e.g., "MM-dd-yyyy").',
    /** UNTRANSLATED */
    zoneinfo: 'Timezone',
    /** UNTRANSLATED */
    zoneinfo_description:
      'The user\'s timezone in IANA format (e.g., "America/New_York" or "Europe/Paris").',
    /** UNTRANSLATED */
    locale: 'Language',
    /** UNTRANSLATED */
    locale_description: 'The user\'s language in IETF BCP 47 format (e.g., "en-US" or "zh-CN").',
    address: {
      /** UNTRANSLATED */
      formatted: 'Address',
      /** UNTRANSLATED */
      streetAddress: 'Street address',
      /** UNTRANSLATED */
      locality: 'City',
      /** UNTRANSLATED */
      region: 'State',
      /** UNTRANSLATED */
      postalCode: 'Zip code',
      /** UNTRANSLATED */
      country: 'Country',
    },
    /** UNTRANSLATED */
    address_description:
      'The user\'s full address in displayable form including all address parts (e.g., "123 Main St, Anytown, USA 12345").',
    /** UNTRANSLATED */
    fullname: 'Fullname',
    /** UNTRANSLATED */
    fullname_description:
      'Flexibly combines familyName, givenName, and middleName based on configuration.',
  },
};

export default Object.freeze(profile);
