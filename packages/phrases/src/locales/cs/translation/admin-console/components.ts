const components = {
  uploader: {
    action_description: 'Drag and drop or browse',
    uploading: 'Uploading...',
    image_limit:
      'Upload image under {{size, number}}KB, {{extensions, list(style: narrow; type: conjunction;)}} only.',
    error_upload: 'Something went wrong. File upload failed.',
    error_file_size: 'File size is too large. Please upload a file under {{limitWithUnit}}.',
    error_file_type:
      'File type is not supported. {{extensions, list(style: narrow; type: conjunction;)}} only.',
    error_file_count: 'You can only upload 1 file.',
  },
};

export default Object.freeze(components);
