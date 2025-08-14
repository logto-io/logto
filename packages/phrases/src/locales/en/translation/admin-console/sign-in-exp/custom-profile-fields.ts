const custom_profile_fields = {
  table: {
    add_button: 'Add profile field',
    title: {
      field_label: 'Field label',
      type: 'Type',
      user_data_key: 'User data key',
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
    built_in_properties: 'Basic user data',
    custom_properties: 'Custom user data',
    custom_data_field_name: 'User data key',
    custom_data_field_input_placeholder: 'Enter the user data key, e.g. `myFavoriteFieldName`',
    custom_field: {
      title: 'Custom data',
      description:
        'Any additional user properties you can define to meet the unique requirements of your application.',
    },
    type_required: 'Please select a property type',
    create_button: 'Create profile field',
  },
  details: {
    page_title: 'Profile field details',
    back_to_sie: 'Back to sign-in experience',
    enter_field_name: 'Enter the profile field name',
    delete_description:
      'This action cannot be undone. Are you sure you want to delete this profile field?',
    field_deleted: 'Profile field {{name}} has been successfully deleted.',
    key: 'User data key',
    field_name: 'Field name',
    field_type: 'Field type',
    settings: 'Settings',
    settings_description:
      'Customize fields to collect more user profile information during sign-up.',
    address_format: 'Address format',
    single_line_address: 'Single-line address',
    multi_line_address: 'Multi-line address (E.g., Street, City, State, Zip Code, Country)',
    components: 'Components',
    components_tip: 'Select the components to compose the complex field.',
    label: 'Field label',
    label_placeholder: 'Label',
    label_tip: 'Need localization? Add languages in <a>Sign-in experience > Content</a>',
    label_tooltip:
      'Floating label that identifies what the field is for. It appears inside the input and moves above the field when the field is focused or has a value.',
    placeholder: 'Field placeholder',
    placeholder_placeholder: 'Placeholder',
    placeholder_tooltip:
      'Inline example or format hint shown inside the input. It typically appears after the label floats and should be short (e.g., MM/DD/YYYY).',
    description: 'Field description',
    description_placeholder: 'Description',
    description_tooltip:
      'Supporting text displayed beneath the text field. Use it for longer instructions or accessibility notes.',
    options: 'Options',
    options_tip:
      'Enter each option on a new line. Use value:label (e.g. red:Red). You can also enter only value; if no label is given, the value is displayed as the label.',
    options_placeholder: 'value1:label1\nvalue2:label2\nvalue3:label3',
    regex: 'Regular expression',
    regex_tip: 'Define a regular expression to validate the input.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Date format',
    date_format_us: 'MM/dd/yyyy (e.g., United States)',
    date_format_uk: 'dd/MM/yyyy (e.g., UK and Europe)',
    date_format_iso: 'yyyy-MM-dd (International standard)',
    custom_date_format: 'Custom date format',
    custom_date_format_placeholder: 'Enter the custom date format. E.g. "MM-dd-yyyy"',
    custom_date_format_tip: 'See <a>date-fns</a> docs for valid formatting tokens.',
    input_length: 'Input length',
    value_range: 'Value range',
    min: 'Minimum',
    max: 'Maximum',
    default_value: 'Default value',
    checkbox_checked: 'Checked (True)',
    checkbox_unchecked: 'Unchecked (False)',
    required: 'Required',
    required_description:
      'When enabled, this field must be filled out by users. When disabled, this field is optional.',
  },
};

export default Object.freeze(custom_profile_fields);
