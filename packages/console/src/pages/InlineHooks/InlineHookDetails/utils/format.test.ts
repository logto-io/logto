import { LogtoInlineHookKey } from '@logto/schemas';

import { InlineHookAction } from '../../types';

import { formatFormDataToRequestData, formatResponseDataToFormData } from './format';

jest.mock('./config', () => ({
  getDefaultScript: () => 'default-script',
  getDefaultContextSample: () => ({ key: 'sample' }),
}));

describe('inline hook form formatters', () => {
  it('defaults enabled and error policy for create mode', () => {
    const result = formatResponseDataToFormData(
      LogtoInlineHookKey.PostSignIn,
      InlineHookAction.Create
    );

    expect(result).toMatchObject({
      hookType: LogtoInlineHookKey.PostSignIn,
      script: 'default-script',
      enabled: true,
      onExecutionError: 'block',
      contextSample: JSON.stringify({ key: 'sample' }, null, 2),
    });
    expect(result.environmentVariables).toEqual([{ key: '', value: '' }]);
  });

  it('maps response data into form fields in edit mode', () => {
    const result = formatResponseDataToFormData(
      LogtoInlineHookKey.PostFirstFactorVerification,
      InlineHookAction.Edit,
      {
        script: 'custom-script',
        enabled: false,
        onExecutionError: 'allow',
        environmentVariables: { API_KEY: 'secret' },
        contextSample: { foo: 'bar' },
      }
    );

    expect(result).toEqual({
      hookType: LogtoInlineHookKey.PostFirstFactorVerification,
      script: 'custom-script',
      enabled: false,
      onExecutionError: 'allow',
      environmentVariables: [{ key: 'API_KEY', value: 'secret' }],
      contextSample: JSON.stringify({ foo: 'bar' }, null, 2),
    });
  });

  it('drops empty environment variables and invalid sample JSON when submitting', () => {
    const payload = formatFormDataToRequestData({
      hookType: LogtoInlineHookKey.PostSignIn,
      script: 'const runInlineHook = () => ({ action: "updateUser" });',
      enabled: true,
      onExecutionError: 'block',
      environmentVariables: [
        { key: '', value: '' },
        { key: 'API_KEY', value: 'secret' },
      ],
      contextSample: '{ invalid',
    });

    expect(payload).toEqual({
      script: 'const runInlineHook = () => ({ action: "updateUser" });',
      enabled: true,
      onExecutionError: 'block',
      environmentVariables: { API_KEY: 'secret' },
      contextSample: undefined,
    });
  });

  it('parses valid context sample JSON for the request body', () => {
    const payload = formatFormDataToRequestData({
      hookType: LogtoInlineHookKey.PostSignIn,
      script: 'script',
      enabled: false,
      onExecutionError: 'allow',
      environmentVariables: [],
      contextSample: JSON.stringify({ hello: 'world' }),
    });

    expect(payload.contextSample).toEqual({ hello: 'world' });
    expect(payload.environmentVariables).toBeUndefined();
  });
});
