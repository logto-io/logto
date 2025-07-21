const custom_profile_fields = {
  table: {
    add_button: 'Add profile field',
    title: {
      field_label: 'Field label',
      type: 'Type',
      user_data_key: 'Key in user profile',
    },
    placeholder: {
      title: 'Collect user profile',
      description:
        'Customize fields to collect more user information during sign-up. <a>Learn more</a>',
    },
  },
  type: {
    Text: 'Text',
    Number: 'Number',
    Date: 'Date',
    Checkbox: 'Checkbox (Boolean)',
    Select: 'Dropdown (Single select)',
    Url: 'URL',
    Regex: 'Regular expression',
    Address: 'Address (Composition)',
    Fullname: 'Fullname (Composition)',
  },
};

export default Object.freeze(custom_profile_fields);
