import {
  usernamePasswordPayloadGuard,
  emailPasswordPayloadGuard,
  phonePasswordPayloadGuard,
  emailPasscodePayloadGuard,
  phonePasscodePayloadGuard,
  socialConnectorPayloadGuard,
} from '@logto/schemas';
import { z } from 'zod';

import type { IdentifierPayload } from './index.js';

export const usernamePasswordPayloadTransformer =
  usernamePasswordPayloadGuard.transform<IdentifierPayload>(({ username, password }) => ({
    identity: {
      type: 'username',
      value: username,
    },
    verification: {
      type: 'password',
      value: password,
    },
  }));

export const emailPasswordPayloadTransformer =
  emailPasswordPayloadGuard.transform<IdentifierPayload>(({ email, password }) => ({
    identity: {
      type: 'email',
      value: email,
    },
    verification: {
      type: 'password',
      value: password,
    },
  }));

export const phonePasswordPayloadTransformer =
  phonePasswordPayloadGuard.transform<IdentifierPayload>(({ phone, password }) => ({
    identity: {
      type: 'phone',
      value: phone,
    },
    verification: {
      type: 'password',
      value: password,
    },
  }));

export const emailPasscodePayloadTransformer =
  emailPasscodePayloadGuard.transform<IdentifierPayload>(({ email, passcode }) => ({
    identity: {
      type: 'email',
      value: email,
    },
    verification: {
      type: 'passcode',
      value: passcode,
    },
  }));

export const phonePasscodePayloadTransformer =
  phonePasscodePayloadGuard.transform<IdentifierPayload>(({ phone, passcode }) => ({
    identity: {
      type: 'phone',
      value: phone,
    },
    verification: {
      type: 'passcode',
      value: passcode,
    },
  }));

export const socialConnectorPayloadTransformer =
  socialConnectorPayloadGuard.transform<IdentifierPayload>(({ connectorId, data }) => ({
    identity: {
      type: 'connectorId',
      value: connectorId,
    },
    verification: {
      type: 'social',
      value: data,
    },
  }));

export const identifierPayloadTransformer = z.union([
  usernamePasswordPayloadTransformer,
  emailPasswordPayloadTransformer,
  phonePasswordPayloadTransformer,
  emailPasscodePayloadTransformer,
  phonePasscodePayloadTransformer,
  socialConnectorPayloadTransformer,
]);
