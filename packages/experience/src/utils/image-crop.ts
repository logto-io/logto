export type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const loadImage = async (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.addEventListener('error', () => {
      reject(new Error('Failed to load image for cropping.'));
    });
    // Allow drawing cross-origin images (e.g. existing avatar URLs) onto the canvas.
    /* eslint-disable @silverhand/fp/no-mutation */
    image.crossOrigin = 'anonymous';
    image.src = source;
    /* eslint-enable @silverhand/fp/no-mutation */
  });

/**
 * Crop the given image to the provided pixel area and export it as a JPEG blob.
 *
 * The output is always a square JPEG (the crop aspect ratio is enforced to 1:1 by the
 * cropper UI) encoded at the quality recommended by the avatar upload design.
 */
export const getCroppedImageBlob = async (
  imageSource: string,
  cropAreaPixels: CropAreaPixels,
  { mimeType = 'image/jpeg', quality = 0.92 }: { mimeType?: string; quality?: number } = {}
): Promise<Blob> => {
  const image = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to acquire canvas context for cropping.');
  }

  const size = Math.round(Math.max(cropAreaPixels.width, cropAreaPixels.height));

  // eslint-disable-next-line @silverhand/fp/no-mutation
  canvas.width = size;
  // eslint-disable-next-line @silverhand/fp/no-mutation
  canvas.height = size;

  // JPEG has no alpha channel; fill with white so transparent PNG pixels are not flattened to black.
  /* eslint-disable @silverhand/fp/no-mutation */
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size, size);
  /* eslint-enable @silverhand/fp/no-mutation */

  context.drawImage(
    image,
    Math.round(cropAreaPixels.x),
    Math.round(cropAreaPixels.y),
    size,
    size,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to export cropped image.'));
        }
      },
      mimeType,
      quality
    );
  });
};
