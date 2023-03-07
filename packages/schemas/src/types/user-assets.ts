import type { allowUploadMimeTypes } from '../index.js';

export type AllowedUploadMimeType = (typeof allowUploadMimeTypes)[number];

export type UserAssetsServiceStatusResponse = {
  status: 'ready' | 'not_configured';
  allowUploadMimeTypes?: string[];
  maxUploadFileSize?: number;
};

export type UserAssetsResponse = {
  url: string;
};
