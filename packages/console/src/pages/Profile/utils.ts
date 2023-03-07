import type { RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { toast } from 'react-hot-toast';

export type LocationState = {
  email: string;
  action: 'changePassword' | 'changeEmail';
};

export const checkLocationState = (state: unknown): state is LocationState =>
  typeof state === 'object' &&
  state !== null &&
  'email' in state &&
  'action' in state &&
  typeof state.email === 'string' &&
  typeof state.action === 'string' &&
  ['changePassword', 'changeEmail'].includes(state.action);

export const popupWindow = (url: string, windowName: string, width: number, height: number) => {
  const outerHeight = window.top?.outerHeight ?? 0;
  const outerWidth = window.top?.outerWidth ?? 0;
  const screenX = window.top?.screenX ?? 0;
  const screenY = window.top?.screenY ?? 0;
  const yAxis = outerHeight / 2 + screenY - height / 2;
  const xAxis = outerWidth / 2 + screenX - width / 2;

  return window.open(
    url,
    windowName,
    [
      `toolbar=no`,
      `location=no`,
      `directories=no`,
      `status=no`,
      `menubar=no`,
      `scrollbars=no`,
      `resizable=no`,
      `copyhistory=no`,
      `width=${width}`,
      `height=${height}`,
      `top=${yAxis}`,
      `left=${xAxis}`,
    ].join(',')
  );
};

export const handleError = async (
  error: unknown,
  exec?: (errorCode: string, message: string) => Promise<boolean | undefined>
) => {
  if (error instanceof HTTPError) {
    const logtoError = await error.response.json<RequestErrorBody>();
    const { code, message } = logtoError;

    const handled = await exec?.(code, message);

    if (handled) {
      return;
    }

    if (error.response.status !== 401) {
      toast.error(message);

      return;
    }
  }
  throw error;
};
