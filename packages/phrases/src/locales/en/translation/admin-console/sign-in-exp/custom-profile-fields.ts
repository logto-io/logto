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
      description: 'Customize fields to collect more user profile information during sign-up.',
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
  modal: {
    title: 'Add profile field',
    subtitle: 'Customize fields to collect more user profile information during sign-up.',
    built_in_properties: 'Built-in user profile properties',
    custom_properties: 'Custom properties',
    custom_data_field_name: 'Custom data field name',
    custom_data_field_input_placeholder:
      'Enter the custom data field name, e.g. `myFavoriteFieldName`',
    custom_field: {
      title: 'Custom data field',
      description:
        'Any additional user properties you can define to meet the unique requirements of your application.',
    },
    create_button: 'Create profile field',
  },
};

export default Object.freeze(custom_profile_fields);
