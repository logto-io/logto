const components = {
  uploader: {
    action_description: 'Drag and drop or browse', // UNTRANSLATED
    uploading: 'Uploading...', // UNTRANSLATED
    image_limit: 'Upload image under 500KB, JPG, PNG, GIF, WEBP only.', // UNTRANSLATED
    error_upload: 'Something went wrong. File upload failed.', // UNTRANSLATED
    error_file_size: 'File size is too large. Please upload a file under {{count, number}}KB.', // UNTRANSLATED
    error_file_type:
      'File type is not supported. {{types, list(style: narrow; type: conjunction;)}} only.', // UNTRANSLATED
    error_file_count_one: 'You can only upload {{count, number}} file.', // UNTRANSLATED
    error_file_count_other: 'You can only upload {{count, number}} files.', // UNTRANSLATED
  },
};

export default components;
