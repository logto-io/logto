import type { AllowedUploadMimeType } from '@logto/schemas';
import classNames from 'classnames';

import Delete from '@/assets/icons/delete.svg';
import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';
import useImageMimeTypes, { maxImageSizeLimit } from '@/hooks/use-image-mime-types';

import IconButton from '../../IconButton';
import FileUploader from '../FileUploader';
import type { Props as FileUploaderProps } from '../FileUploader';

import * as styles from './index.module.scss';

export type Props = Omit<FileUploaderProps, 'maxSize' | 'allowedMimeTypes'> & {
  readonly allowedMimeTypes?: AllowedUploadMimeType[];
  readonly name: string;
  readonly value: string;
  readonly onDelete: () => void;
  readonly className?: string;
};

function ImageUploader({
  name,
  value,
  onDelete,
  allowedMimeTypes: imageMimeTypes,
  className,
  ...rest
}: Props) {
  const { allowedMimeTypes } = useImageMimeTypes(imageMimeTypes);
  return value ? (
    <div className={classNames(styles.imageUploader, className)}>
      <ImageWithErrorFallback
        containerClassName={styles.container}
        src={value}
        alt={name}
        /**
         * Some social connectors like Google will block the references to its image resource,
         * without specifying the referrerPolicy attribute. Reference:
         * https://stackoverflow.com/questions/40570117/http403-forbidden-error-when-trying-to-load-img-src-with-google-profile-pic
         */
        referrerPolicy="no-referrer"
      />
      <IconButton
        className={styles.delete}
        onClick={() => {
          onDelete();
        }}
      >
        <Delete />
      </IconButton>
    </div>
  ) : (
    <FileUploader
      allowedMimeTypes={allowedMimeTypes}
      maxSize={maxImageSizeLimit}
      className={className}
      {...rest}
    />
  );
}

export default ImageUploader;
