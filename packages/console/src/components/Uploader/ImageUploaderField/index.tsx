import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { convertToFileExtensionArray } from '@/utils/uploader';

import ImageUploader, { maxImageSizeLimit, allowedImageMimeTypes } from '../ImageUploader';
import type { Props as ImageUploaderProps } from '../ImageUploader';
import * as styles from './index.module.scss';

type Props = Pick<ImageUploaderProps, 'name' | 'value' | 'actionDescription'> & {
  onChange: (value: string) => void;
};

function ImageUploaderField({ onChange, ...rest }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const limitDescription = t('components.uploader.image_limit', {
    size: maxImageSizeLimit / 1024,
    extensions: convertToFileExtensionArray(allowedImageMimeTypes),
  });

  const [uploadError, setUploadError] = useState<string>();

  return (
    <div>
      <ImageUploader
        onCompleted={onChange}
        onUploadErrorChange={setUploadError}
        onDelete={() => {
          onChange('');
        }}
        {...rest}
      />
      <div className={classNames(styles.description, Boolean(uploadError) && styles.error)}>
        {uploadError ?? limitDescription}
      </div>
    </div>
  );
}

export default ImageUploaderField;
