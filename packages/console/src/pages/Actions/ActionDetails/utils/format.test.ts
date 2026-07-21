import { LogtoActionKey } from '@logto/schemas';

import { ActionPageMode } from '../../types';

import { formatFormDataToRequestData, formatResponseDataToFormData } from './format';

jest.mock('./config', () => ({
  getDefaultScript: () => 'default-script',
  getDefaultContextSample: () => ({ key: 'sample' }),
}));

describe('action form formatters', () => {
  it('defaults enabled and error policy for create mode', () => {
    const result = formatResponseDataToFormData(LogtoActionKey.PostSignIn, ActionPageMode.Create);

    expect(result).toMatchObject({
      actionType: LogtoActionKey.PostSignIn,
      script: 'default-script',
      enabled: true,
      onExecutionError: 'block',
      contextSample: JSON.stringify({ key: 'sample' }, null, 2),
    });
    expect(result.environmentVariables).toEqual([{ key: '', value: '' }]);
  });

  it('maps response data into form fields in edit mode', () => {
    const result = formatResponseDataToFormData(LogtoActionKey.PostSignIn, ActionPageMode.Edit, {
      script: 'custom-script',
      enabled: false,
      onExecutionError: 'allow',
      environmentVariables: { API_KEY: 'secret' },
      contextSample: { foo: 'bar' },
    });

    expect(result).toEqual({
      actionType: LogtoActionKey.PostSignIn,
      script: 'custom-script',
      enabled: false,
      onExecutionError: 'allow',
      environmentVariables: [{ key: 'API_KEY', value: 'secret' }],
      contextSample: JSON.stringify({ foo: 'bar' }, null, 2),
    });
  });

  it('forces PostFirstFactorVerification form values to block even if stored as allow', () => {
    const result = formatResponseDataToFormData(
      LogtoActionKey.PostFirstFactorVerification,
      ActionPageMode.Edit,
      {
        script: 'custom-script',
        enabled: false,
        onExecutionError: 'allow',
        environmentVariables: { API_KEY: 'secret' },
        contextSample: { foo: 'bar' },
      }
    );

    expect(result).toEqual({
      actionType: LogtoActionKey.PostFirstFactorVerification,
      script: 'custom-script',
      enabled: false,
      onExecutionError: 'block',
      environmentVariables: [{ key: 'API_KEY', value: 'secret' }],
      contextSample: JSON.stringify({ foo: 'bar' }, null, 2),
    });
  });

  it('drops empty environment variables and invalid sample JSON when submitting', () => {
    const payload = formatFormDataToRequestData({
      actionType: LogtoActionKey.PostSignIn,
      script: 'const runAction = () => ({ action: "updateUser" });',
      enabled: true,
      onExecutionError: 'block',
      environmentVariables: [
        { key: '', value: '' },
        { key: 'API_KEY', value: 'secret' },
      ],
      contextSample: '{ invalid',
    });

    expect(payload).toEqual({
      script: 'const runAction = () => ({ action: "updateUser" });',
      enabled: true,
      onExecutionError: 'block',
      environmentVariables: { API_KEY: 'secret' },
      contextSample: undefined,
    });
  });

  it('parses valid context sample JSON for the request body', () => {
    const payload = formatFormDataToRequestData({
      actionType: LogtoActionKey.PostSignIn,
      script: 'script',
      enabled: false,
      onExecutionError: 'allow',
      environmentVariables: [],
      contextSample: JSON.stringify({ hello: 'world' }),
    });

    expect(payload.contextSample).toEqual({ hello: 'world' });
    expect(payload.environmentVariables).toBeUndefined();
    expect(payload.onExecutionError).toBe('allow');
  });

  it('never submits allow for PostFirstFactorVerification', () => {
    const payload = formatFormDataToRequestData({
      actionType: LogtoActionKey.PostFirstFactorVerification,
      script: 'script',
      enabled: true,
      onExecutionError: 'allow',
      environmentVariables: [],
      contextSample: JSON.stringify({ hello: 'world' }),
    });

    expect(payload.onExecutionError).toBe('block');
  });
});
