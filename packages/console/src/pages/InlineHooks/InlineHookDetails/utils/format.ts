import {
  type InlineHook,
  type Json,
  type LogtoInlineHookKey,
  type InlineHookExecutionErrorPolicy,
} from '@logto/schemas';

import { InlineHookAction } from '../../types';
import { type InlineHookForm } from '../type';

import { getDefaultContextSample, getDefaultScript } from './config';

const formatEnvVariablesResponseToFormData = (enVariables?: InlineHook['environmentVariables']) => {
  if (!enVariables) {
    return;
  }

  return Object.entries(enVariables).map(([key, value]) => ({ key, value }));
};

const formatEnvVariablesFormDataToRequest = (
  envVariables: InlineHookForm['environmentVariables']
) => {
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

const defaultOnExecutionError = 'block' satisfies InlineHookExecutionErrorPolicy;

export const formatResponseDataToFormData = (
  hookType: LogtoInlineHookKey,
  action: InlineHookAction,
  data?: InlineHook
): InlineHookForm => {
  return {
    hookType,
    script: data?.script ?? getDefaultScript(hookType),
    enabled: data?.enabled ?? action === InlineHookAction.Create,
    onExecutionError: data?.onExecutionError ?? defaultOnExecutionError,
    environmentVariables: formatEnvVariablesResponseToFormData(data?.environmentVariables) ?? [
      { key: '', value: '' },
    ],
    contextSample: formatSampleCodeJsonToString(
      data?.contextSample ?? getDefaultContextSample(hookType)
    ),
  };
};

export const formatFormDataToRequestData = (data: InlineHookForm): InlineHook => {
  return {
    script: data.script,
    enabled: data.enabled,
    onExecutionError: data.onExecutionError,
    environmentVariables: formatEnvVariablesFormDataToRequest(data.environmentVariables),
    contextSample: formatSampleCodeStringToJson(data.contextSample),
  };
};
