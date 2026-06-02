import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import modalStyles from '../../scss/modal.module.scss';
import Button from '../../shared/components/Button';
import IconButton from '../../shared/components/IconButton';
import { getCroppedImageBlob, type CropAreaPixels } from '../../utils/image-crop';

import styles from './index.module.scss';

// Inlined to keep this shared modal resolvable from both the experience and account jest/build
// pipelines, which use different module aliases and svg-import handling.
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.4099 12.0002L19.7099 5.71019C19.8982 5.52188 20.004 5.26649 20.004 5.00019C20.004 4.73388 19.8982 4.47849 19.7099 4.29019C19.5216 4.10188 19.2662 3.99609 18.9999 3.99609C18.7336 3.99609 18.4782 4.10188 18.2899 4.29019L11.9999 10.5902L5.70994 4.29019C5.52164 4.10188 5.26624 3.99609 4.99994 3.99609C4.73364 3.99609 4.47824 4.10188 4.28994 4.29019C4.10164 4.47849 3.99585 4.73388 3.99585 5.00019C3.99585 5.26649 4.10164 5.52188 4.28994 5.71019L10.5899 12.0002L4.28994 18.2902C4.19621 18.3831 4.12182 18.4937 4.07105 18.6156C4.02028 18.7375 3.99414 18.8682 3.99414 19.0002C3.99414 19.1322 4.02028 19.2629 4.07105 19.3848C4.12182 19.5066 4.19621 19.6172 4.28994 19.7102C4.3829 19.8039 4.4935 19.8783 4.61536 19.9291C4.73722 19.9798 4.86793 20.006 4.99994 20.006C5.13195 20.006 5.26266 19.9798 5.38452 19.9291C5.50638 19.8783 5.61698 19.8039 5.70994 19.7102L11.9999 13.4102L18.2899 19.7102C18.3829 19.8039 18.4935 19.8783 18.6154 19.9291C18.7372 19.9798 18.8679 20.006 18.9999 20.006C19.132 20.006 19.2627 19.9798 19.3845 19.9291C19.5064 19.8783 19.617 19.8039 19.7099 19.7102C19.8037 19.6172 19.8781 19.5066 19.9288 19.3848C19.9796 19.2629 20.0057 19.1322 20.0057 19.0002C20.0057 18.8682 19.9796 18.7375 19.9288 18.6156C19.8781 18.4937 19.8037 18.3831 19.7099 18.2902L13.4099 12.0002Z"
      fill="currentcolor"
    />
  </svg>
);

const minZoom = 1;
const maxZoom = 3;
const zoomStep = 0.05;

type Props = {
  /** Object URL (or data URL) of the image to crop. The modal opens whenever this is set. */
  readonly imageSource?: string;
  readonly isUploading?: boolean;
  readonly uploadError?: string;
  readonly onCancel: () => void;
  readonly onConfirm: (blob: Blob) => void | Promise<void>;
};

const AvatarCropModal = ({
  imageSource,
  isUploading = false,
  uploadError,
  onCancel,
  onConfirm,
}: Props) => {
  const { t: tAction } = useTranslation(undefined, { keyPrefix: 'action' });
  const { t: tAvatar } = useTranslation(undefined, { keyPrefix: 'profile.avatar_upload' });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(minZoom);
  const [cropError, setCropError] = useState<string>();
  const [isCropping, setIsCropping] = useState(false);
  const croppedAreaPixelsRef = useRef<CropAreaPixels>();
  const isBusy = isUploading || isCropping;

  const handleCropComplete = useCallback(
    (_croppedArea: CropAreaPixels, croppedAreaPixels: CropAreaPixels) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      croppedAreaPixelsRef.current = croppedAreaPixels;
    },
    []
  );

  const resetState = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(minZoom);
    setCropError(undefined);
    setIsCropping(false);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    croppedAreaPixelsRef.current = undefined;
  }, []);

  const handleCancel = useCallback(() => {
    if (isBusy) {
      return;
    }

    resetState();
    onCancel();
  }, [isBusy, onCancel, resetState]);

  const handleConfirm = useCallback(async () => {
    if (!imageSource || !croppedAreaPixelsRef.current || isBusy) {
      return;
    }

    setCropError(undefined);
    setIsCropping(true);

    try {
      const cropResult = await getCroppedImageBlob(imageSource, croppedAreaPixelsRef.current)
        .then((blob) => ({ blob, ok: true as const }))
        .catch(() => ({ ok: false as const }));

      if (!cropResult.ok) {
        setCropError(tAvatar('error_crop'));
        return;
      }

      await onConfirm(cropResult.blob);
    } finally {
      setIsCropping(false);
    }
  }, [imageSource, isBusy, onConfirm, tAvatar]);

  return (
    <ReactModal
      shouldCloseOnEsc={!isBusy}
      shouldCloseOnOverlayClick={!isBusy}
      role="dialog"
      isOpen={Boolean(imageSource)}
      className={styles.modal}
      overlayClassName={modalStyles.overlay}
      onAfterClose={resetState}
      onRequestClose={handleCancel}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          {tAvatar('crop_title')}
          <IconButton
            disabled={isBusy}
            aria-label={tAction('cancel')}
            title={tAction('cancel')}
            onClick={handleCancel}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div className={styles.cropArea}>
          {imageSource && (
            <Cropper
              image={imageSource}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid={false}
              minZoom={minZoom}
              maxZoom={maxZoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          )}
        </div>
        <div className={styles.zoomRow}>
          <span className={styles.zoomLabel}>{tAvatar('zoom')}</span>
          <input
            className={styles.zoomSlider}
            type="range"
            min={minZoom}
            max={maxZoom}
            step={zoomStep}
            value={zoom}
            aria-label={tAvatar('zoom')}
            disabled={isBusy}
            onChange={(event) => {
              setZoom(Number(event.target.value));
            }}
          />
        </div>
        {(cropError ?? uploadError) && (
          <div className={styles.errorText} role="alert">
            {cropError ?? uploadError}
          </div>
        )}
        <div className={styles.footer}>
          <Button
            title="action.cancel"
            type="secondary"
            size="small"
            isDisabled={isBusy}
            onClick={handleCancel}
          />
          <Button
            title="action.save"
            size="small"
            isLoading={isBusy}
            onClick={() => {
              void handleConfirm();
            }}
          />
        </div>
      </div>
    </ReactModal>
  );
};

export default AvatarCropModal;
