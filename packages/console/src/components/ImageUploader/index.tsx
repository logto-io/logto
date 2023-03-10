import { useTranslation } from 'react-i18next';

import Delete from '@/assets/images/delete.svg';

import FileUploader from '../FileUploader';
import IconButton from '../IconButton';
import * as styles from './index.module.scss';

type Props = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

const maxImageSize = 500 * 1024; // 500 KB

const ImageUploader = ({ name, value, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const limitDescription = t('components.uploader.image_limit');

  if (!value) {
    return (
      <FileUploader
        allowedMimeTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
        maxSize={maxImageSize}
        limitDescription={limitDescription}
        onCompleted={onChange}
      />
    );
  }

  return (
    <div>
      <div className={styles.imageUploader}>
        <img alt={name} src={value} />
        <IconButton
          className={styles.delete}
          onClick={() => {
            onChange('');
          }}
        >
          <Delete />
        </IconButton>
      </div>
      <div className={styles.limit}>{limitDescription}</div>
    </div>
  );
};

export default ImageUploader;
