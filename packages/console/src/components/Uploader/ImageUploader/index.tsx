import type { AllowedUploadMimeType } from '@logto/schemas';

import Delete from '@/assets/icons/delete.svg';
import ImageWithErrorFallback from '@/components/ImageWithErrorFallback';

import IconButton from '../../IconButton';
import FileUploader from '../FileUploader';
import type { Props as FileUploaderProps } from '../FileUploader';

import * as styles from './index.module.scss';

export const maxImageSizeLimit = 500 * 1024; // 500 KB

export const allowedImageMimeTypes: AllowedUploadMimeType[] = [
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/vnd.microsoft.icon',
];

export type Props = Omit<FileUploaderProps, 'maxSize' | 'allowedMimeTypes'> & {
  name: string;
  value: string;
  onDelete: () => void;
};

function ImageUploader({ name, value, onDelete, ...rest }: Props) {
  return value ? (
    <div className={styles.imageUploader}>
      <ImageWithErrorFallback
        className={styles.image}
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
    <FileUploader allowedMimeTypes={allowedImageMimeTypes} maxSize={maxImageSizeLimit} {...rest} />
  );
}

export default ImageUploader;
