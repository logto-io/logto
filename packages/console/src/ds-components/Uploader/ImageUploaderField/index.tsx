import type { UserAssetsServiceStatus } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';

import useImageMimeTypes from '@/hooks/use-image-mime-types';

import ImageUploader from '../ImageUploader';
import type { Props as ImageUploaderProps } from '../ImageUploader';

import * as styles from './index.module.scss';

type Props = Omit<ImageUploaderProps, 'onDelete' | 'onCompleted' | 'onUploadErrorChange'> & {
  readonly onChange: (value: string) => void;
  readonly allowedMimeTypes?: UserAssetsServiceStatus['allowUploadMimeTypes'];
};

function ImageUploaderField({ onChange, allowedMimeTypes: mimeTypes, ...rest }: Props) {
  const { allowedMimeTypes, description: limitDescription } = useImageMimeTypes(mimeTypes);

  const [uploadError, setUploadError] = useState<string>();

  return (
    <div>
      <ImageUploader
        allowedMimeTypes={allowedMimeTypes}
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
