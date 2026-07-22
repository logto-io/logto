import {
  LogtoActionKey,
  type LogtoAction,
  type Json,
  type ActionExecutionErrorPolicy,
} from '@logto/schemas';

import { ActionPageMode } from '../../types';
import { type ActionForm } from '../type';

import { getDefaultContextSample, getDefaultScript } from './config';

const formatEnvVariablesResponseToFormData = (
  envVariables?: LogtoAction['environmentVariables']
) => {
  if (!envVariables) {
    return;
  }

  return Object.entries(envVariables).map(([key, value]) => ({ key, value }));
};

const formatEnvVariablesFormDataToRequest = (envVariables: ActionForm['environmentVariables']) => {
  if (!envVariables) {
    return;
  }

  const entries = envVariables.filter(({ key, value }) => key && value);

  if (entries.length === 0) {
    return;
  }

  return Object.fromEntries(entries.map(({ key, value }) => [key, value]));
};

const formatSampleCodeJsonToString = (sampleJson?: Json) => {
  if (!sampleJson) {
    return;
  }

  return JSON.stringify(sampleJson, null, 2);
};

const formatSampleCodeStringToJson = (sampleCode?: string) => {
  if (!sampleCode) {
    return;
  }

  try {
    // eslint-disable-next-line no-restricted-syntax -- guarded by form validation
    return JSON.parse(sampleCode) as Json;
  } catch {}
};

const defaultOnExecutionError = 'block' satisfies ActionExecutionErrorPolicy;

/**
 * Core always maps PostFirstFactorVerification execution errors to
 * `rejectInvalidCredentials`, so the console never persists `allow` for it.
 */
const resolveOnExecutionError = (
  actionType: LogtoActionKey,
  onExecutionError?: ActionExecutionErrorPolicy
): ActionExecutionErrorPolicy => {
  if (actionType === LogtoActionKey.PostFirstFactorVerification) {
    return defaultOnExecutionError;
  }

  return onExecutionError ?? defaultOnExecutionError;
};

export const formatResponseDataToFormData = (
  actionType: LogtoActionKey,
  mode: ActionPageMode,
  data?: LogtoAction
): ActionForm => {
  return {
    actionType,
    script: data?.script ?? getDefaultScript(actionType),
    enabled: data?.enabled ?? mode === ActionPageMode.Create,
    onExecutionError: resolveOnExecutionError(actionType, data?.onExecutionError),
    environmentVariables: formatEnvVariablesResponseToFormData(data?.environmentVariables) ?? [
      { key: '', value: '' },
    ],
    contextSample: formatSampleCodeJsonToString(
      data?.contextSample ?? getDefaultContextSample(actionType)
    ),
  };
};

export const formatFormDataToRequestData = (data: ActionForm): LogtoAction => {
  return {
    script: data.script,
    enabled: data.enabled,
    onExecutionError: resolveOnExecutionError(data.actionType, data.onExecutionError),
    environmentVariables: formatEnvVariablesFormDataToRequest(data.environmentVariables),
    contextSample: formatSampleCodeStringToJson(data.contextSample),
  };
};

export const formatFormDataToTestRequestPayload = ({
  actionType,
  script,
  environmentVariables,
  contextSample,
}: ActionForm) => {
  return {
    actionType,
    script,
    environmentVariables: formatEnvVariablesFormDataToRequest(environmentVariables),
    event: formatSampleCodeStringToJson(contextSample) ?? getDefaultContextSample(actionType),
  };
};
