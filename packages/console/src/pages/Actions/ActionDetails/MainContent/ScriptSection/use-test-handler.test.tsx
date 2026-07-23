import { LogtoActionKey } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useApi from '@/hooks/use-api';

import { type ActionForm } from '../../type';

import useTestHandler from './use-test-handler';

jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseApi = jest.mocked(useApi);
const mockPost = jest.fn();

function Wrapper({ children }: { readonly children: ReactNode }) {
  const methods = useForm<ActionForm>({
    defaultValues: {
      actionType: LogtoActionKey.PostSignIn,
      script: 'const runAction = () => undefined;',
      enabled: true,
      onExecutionError: 'block',
      environmentVariables: [{ key: '', value: '' }],
      contextSample: JSON.stringify({
        key: LogtoActionKey.PostSignIn,
        interactionEvent: 'SignIn',
        user: { id: 'user-id' },
      }),
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('useTestHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseApi.mockReturnValue({
      post: mockPost,
    } as unknown as ReturnType<typeof useApi>);
  });

  it('renders an undefined result for a successful no-content response', async () => {
    const json = jest.fn();
    mockPost.mockResolvedValue({
      status: 204,
      json,
    });
    const { result } = renderHook(() => useTestHandler(), { wrapper: Wrapper });

    await act(result.current.onTestHandler);

    expect(json).not.toHaveBeenCalled();
    expect(result.current.testResult).toEqual({ payload: 'undefined' });
  });

  it('renders a null JSON result', async () => {
    const json = jest.fn().mockResolvedValue(null);
    mockPost.mockResolvedValue({
      status: 200,
      json,
    });
    const { result } = renderHook(() => useTestHandler(), { wrapper: Wrapper });

    await act(result.current.onTestHandler);

    expect(json).toHaveBeenCalledTimes(1);
    expect(result.current.testResult).toEqual({ payload: 'null' });
  });
});
