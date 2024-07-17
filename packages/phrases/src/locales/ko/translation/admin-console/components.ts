const components = {
  uploader: {
    action_description: '드래그 앤 드롭 또는 탐색하기',
    uploading: '업로드 중...',
    image_limit:
      '{{size, number}}KB 미만의 {{extensions, list(style: narrow; type: conjunction;)}} 파일만 업로드하세요.',
    error_upload: '오류가 발생했습니다. 파일 업로드에 실패하였습니다.',
    error_file_size: '파일 크기가 너무 커요. {{limitWithUnit}} 미만의 파일을 업로드해 주세요.',
    error_file_type:
      '지원되지 않는 파일 유형이에요. {{extensions, list(style: narrow; type: conjunction;)}} 파일만 사용 가능해요.',
    error_file_count: '파일은 1개만 업로드 가능합니다.',
  },
};

export default Object.freeze(components);
