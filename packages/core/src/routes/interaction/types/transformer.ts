import {
  usernamePasswordPayloadGuard,
  emailPasswordPayloadGuard,
  phonePasswordPayloadGuard,
  emailPasscodePayloadGuard,
  phonePasscodePayloadGuard,
  socialConnectorPayloadGuard,
} from '@logto/schemas';
import { z } from 'zod';

export const usernamePasswordPayloadTransformer = usernamePasswordPayloadGuard.transform((value) =>
  Object.freeze({
    type: 'username_password',
    ...value,
  })
);

export const emailPasswordPayloadTransformer = emailPasswordPayloadGuard.transform((value) =>
  Object.freeze({
    type: 'email_password',
    ...value,
  })
);

export const phonePasswordPayloadTransformer = phonePasswordPayloadGuard.transform((value) =>
  Object.freeze({
    type: 'phone_password',
    ...value,
  })
);

export const emailPasscodePayloadTransformer = emailPasscodePayloadGuard.transform((value) =>
  Object.freeze({
    type: 'email_passcode',
    ...value,
  })
);

export const phonePasscodePayloadTransformer = phonePasscodePayloadGuard.transform((value) =>
  Object.freeze({
    type: 'phone_passcode',
    ...value,
  })
);

export const socialConnectorPayloadTransformer = socialConnectorPayloadGuard.transform((value) =>
  Object.freeze({
    type: 'social',
    ...value,
  })
);

export const identifierPayloadTransformer = z.union([
  usernamePasswordPayloadTransformer,
  emailPasswordPayloadTransformer,
  phonePasswordPayloadTransformer,
  emailPasscodePayloadTransformer,
  phonePasscodePayloadTransformer,
  socialConnectorPayloadTransformer,
]);
