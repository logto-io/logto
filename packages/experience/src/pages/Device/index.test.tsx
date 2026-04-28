/* eslint-disable max-lines */
import { deviceFlowXsrfCookieKey, experience, oidcRoutes } from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import ToastProvider from '@/Providers/ToastProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import Device from '.';
import DeviceSuccess from './Success';

const defaultXsrf = 'foo';

const buildDeviceSearchParams = ({
  error,
  inputCode,
  userCode,
}: {
  readonly error?: string;
  readonly inputCode?: string;
  readonly userCode?: string;
}) => {
  const searchParams = new URLSearchParams();

  if (error) {
    searchParams.append('error', error);
  }

  if (inputCode) {
    searchParams.append('input_code', inputCode);
  }

  if (userCode) {
    searchParams.append('user_code', userCode);
  }

  return searchParams;
};

const setDeviceFlowXsrfCookie = (xsrf = defaultXsrf) => {
  /* eslint-disable @silverhand/fp/no-mutation */
  document.cookie = `${String(deviceFlowXsrfCookieKey)}=; Max-Age=0; path=/`;
  document.cookie = `${String(deviceFlowXsrfCookieKey)}=${xsrf}; path=/`;
  /* eslint-enable @silverhand/fp/no-mutation */
};

const clearDeviceFlowXsrfCookie = () => {
  /* eslint-disable @silverhand/fp/no-mutation */
  document.cookie = `${String(deviceFlowXsrfCookieKey)}=; Max-Age=0; path=/`;
  /* eslint-enable @silverhand/fp/no-mutation */
};

const renderDevice = (options: {
  readonly clearXsrfCookie?: boolean;
  readonly xsrf?: string;
  readonly error?: string;
  readonly inputCode?: string;
  readonly userCode?: string;
}) => {
  if (options.clearXsrfCookie) {
    clearDeviceFlowXsrfCookie();
  } else {
    setDeviceFlowXsrfCookie(options.xsrf);
  }

  return renderWithPageContext(
    <SettingsProvider>
      <Device />
    </SettingsProvider>,
    {
      initialEntries: [`/device?${buildDeviceSearchParams(options).toString()}`],
    }
  );
};

const renderDeviceWithToast = (options: {
  readonly clearXsrfCookie?: boolean;
  readonly xsrf?: string;
  readonly error?: string;
  readonly inputCode?: string;
  readonly userCode?: string;
}) => {
  if (options.clearXsrfCookie) {
    clearDeviceFlowXsrfCookie();
  } else {
    setDeviceFlowXsrfCookie(options.xsrf);
  }

  return renderWithPageContext(
    <SettingsProvider>
      <ToastProvider>
        <Device />
      </ToastProvider>
    </SettingsProvider>,
    {
      initialEntries: [`/device?${buildDeviceSearchParams(options).toString()}`],
    }
  );
};

const renderDeviceRoutes = (options: {
  readonly clearXsrfCookie?: boolean;
  readonly xsrf?: string;
  readonly error?: string;
  readonly inputCode?: string;
  readonly userCode?: string;
}) => {
  if (options.clearXsrfCookie) {
    clearDeviceFlowXsrfCookie();
  } else {
    setDeviceFlowXsrfCookie(options.xsrf);
  }

  return renderWithPageContext(
    <SettingsProvider>
      <ToastProvider>
        <Routes>
          <Route path={`/${experience.routes.device}`} element={<Device />} />
          <Route path={`/${experience.routes.device}/success`} element={<DeviceSuccess />} />
        </Routes>
      </ToastProvider>
    </SettingsProvider>,
    {
      initialEntries: [
        `/${experience.routes.device}?${buildDeviceSearchParams(options).toString()}`,
      ],
    }
  );
};

const getVisibleInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[name="device_user_code"]');

type MockFetchResponse = Pick<
  Response,
  'clone' | 'json' | 'ok' | 'redirected' | 'status' | 'text' | 'url'
>;

const createFetchResponse = ({
  ok = true,
  redirected = false,
  status = ok ? 200 : 400,
  url = 'http://localhost/oidc/device',
  jsonBody,
  textBody,
}: {
  readonly ok?: boolean;
  readonly redirected?: boolean;
  readonly status?: number;
  readonly url?: string;
  readonly jsonBody?: {
    readonly error?: string;
    readonly error_description?: string;
  };
  readonly textBody?: string;
}): Response => {
  const response: MockFetchResponse = {
    clone: () =>
      createFetchResponse({
        jsonBody,
        ok,
        redirected,
        status,
        textBody,
        url,
      }),
    json: async () => {
      if (!jsonBody) {
        throw new Error('No JSON body');
      }

      return jsonBody;
    },
    ok,
    redirected,
    status,
    text: async () => textBody ?? '',
    url,
  };

  return response as Response;
};

describe('<Device />', () => {
  const fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();
  const originalFetch = globalThis.fetch;
  const originalWindowFetch = window.fetch;

  beforeAll(() => {
    /* eslint-disable @silverhand/fp/no-mutating-methods */
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
    /* eslint-enable @silverhand/fp/no-mutating-methods */
  });

  afterEach(() => {
    fetchMock.mockReset();
    clearDeviceFlowXsrfCookie();
    sessionStorage.clear();
  });

  afterAll(() => {
    /* eslint-disable @silverhand/fp/no-mutating-methods */
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: originalFetch,
      writable: true,
    });
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      value: originalWindowFetch,
      writable: true,
    });
    /* eslint-enable @silverhand/fp/no-mutating-methods */
  });

  it('renders the default input state', async () => {
    const { container, queryByText } = renderDevice({});

    await waitFor(() => {
      expect(getVisibleInput(container)).not.toBeNull();
    });

    expect(getVisibleInput(container)?.value).toBe('');
    expect(container.querySelector('button')!.disabled).toBe(false);
    expect(queryByText('description.device_activation_description')).not.toBeNull();
  });

  it('shows an invalid-session error page when the xsrf cookie is missing', () => {
    const { queryByText } = renderDevice({ clearXsrfCookie: true });

    expect(queryByText('error.invalid_session')).not.toBeNull();
  });

  it('shows an inline error when continue is clicked without a code', async () => {
    const { container, getByRole, queryByText } = renderDevice({});

    await waitFor(() => {
      expect(getVisibleInput(container)).not.toBeNull();
    });

    await act(async () => {
      fireEvent.click(container.querySelector('button')!);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(queryByText('description.device_activation_error_description')).not.toBeNull();
    expect(getByRole('alert').textContent).toBe('error.device_code_required');
  });

  it('renders the error state and reuses the input_code query value', async () => {
    const { container, getByRole, queryByText } = renderDevice({
      error: 'NoCodeError',
      inputCode: 'sdiewold',
    });

    await waitFor(() => {
      expect(getVisibleInput(container)?.value).toBe('SDIEWOLD');
    });

    expect(queryByText('description.device_activation_error_description')).not.toBeNull();
    expect(getByRole('alert').textContent).toBe('error.device_code_required');
  });

  it('shows an invalid session toast for InvalidRequest instead of an inline field error', async () => {
    const { queryByRole, queryByText } = renderDeviceWithToast({
      error: 'InvalidRequest',
    });

    await waitFor(() => {
      expect(queryByText('error.invalid_session')).not.toBeNull();
    });

    expect(queryByText('description.device_activation_description')).not.toBeNull();
    expect(queryByRole('alert')).toBeNull();
  });

  it('renders confirm state using the query user code as the visible value', async () => {
    const { container } = renderDevice({
      userCode: 'ABCD-EFGH',
    });

    await waitFor(() => {
      expect(getVisibleInput(container)?.value).toBe('ABCD-EFGH');
    });

    expect(container.querySelector('button')!.disabled).toBe(false);
  });

  it('submits input mode with confirm=yes so valid codes skip the extra confirm step', async () => {
    fetchMock.mockResolvedValue(
      createFetchResponse({
        ok: true,
        redirected: true,
        url: `http://localhost/${experience.routes.device}/success`,
      })
    );

    sessionStorage.setItem('app_id', 'app_123');
    sessionStorage.setItem('organization_id', 'org_123');
    sessionStorage.setItem('ui_locales', 'fr-CA fr');

    const { container } = renderDeviceRoutes({});

    await waitFor(() => {
      expect(getVisibleInput(container)).not.toBeNull();
    });

    const input = getVisibleInput(container);

    if (!input) {
      throw new Error('Expected visible device input to exist');
    }

    fireEvent.change(input, { target: { value: 'ab12-cd34' } });
    await act(async () => {
      fireEvent.click(container.querySelector('button')!);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [requestUrl, request] = fetchMock.mock.calls[0] ?? [];
    const requestBody = String(request?.body ?? '');

    expect(requestUrl).toBe(
      `${oidcRoutes.codeVerification}?organization_id=org_123&app_id=app_123&ui_locales=fr-CA+fr`
    );
    expect(requestBody).toContain('xsrf=foo');
    expect(requestBody).toContain('user_code=AB12-CD34');
    expect(requestBody).toContain('confirm=yes');

    await waitFor(() => {
      expect(container.textContent).toContain('description.device_activation_success_description');
    });
  });

  it('shows the continue button loading state while the provider request is in flight', async () => {
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        void resolve;
      })
    );

    const { container } = renderDevice({});

    await waitFor(() => {
      expect(getVisibleInput(container)).not.toBeNull();
    });

    fireEvent.change(getVisibleInput(container)!, { target: { value: 'ab12-cd34' } });
    await act(async () => {
      fireEvent.click(container.querySelector('button')!);
    });

    expect(container.querySelector('button')!.disabled).toBe(true);
  });

  it('shows an invalid session toast when the provider returns invalid_request JSON', async () => {
    fetchMock.mockResolvedValue(
      createFetchResponse({
        jsonBody: {
          error: 'invalid_request',
          error_description: 'could not find device form details',
        },
        ok: false,
        status: 400,
      })
    );

    const { container, queryByText } = renderDeviceWithToast({});

    await waitFor(() => {
      expect(getVisibleInput(container)).not.toBeNull();
    });

    fireEvent.change(getVisibleInput(container)!, { target: { value: 'ab12-cd34' } });
    await act(async () => {
      fireEvent.click(container.querySelector('button')!);
    });

    await waitFor(() => {
      expect(queryByText('error.invalid_session')).not.toBeNull();
    });
  });

  it('follows redirected error routes and shows the session-expired toast', async () => {
    fetchMock.mockResolvedValue(
      createFetchResponse({
        ok: true,
        redirected: true,
        url: `http://localhost/${experience.routes.device}?error=InvalidRequest`,
      })
    );

    const { container, queryByRole, queryByText } = renderDeviceRoutes({});

    await waitFor(() => {
      expect(getVisibleInput(container)).not.toBeNull();
    });

    fireEvent.change(getVisibleInput(container)!, { target: { value: 'ab12-cd34' } });
    await act(async () => {
      fireEvent.click(container.querySelector('button')!);
    });

    await waitFor(() => {
      expect(queryByText('error.invalid_session')).not.toBeNull();
    });

    expect(queryByRole('alert')).toBeNull();
  });

  it('falls back to the success route when the provider responds with 200 without a redirect', async () => {
    fetchMock.mockResolvedValue(createFetchResponse({ ok: true }));

    const { container } = renderDeviceRoutes({});

    await waitFor(() => {
      expect(getVisibleInput(container)).not.toBeNull();
    });

    fireEvent.change(getVisibleInput(container)!, { target: { value: 'ab12-cd34' } });
    await act(async () => {
      fireEvent.click(container.querySelector('button')!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('description.device_activation_success_description');
    });
  });

  it('submits the edited confirm-mode code instead of the query seed value', async () => {
    fetchMock.mockResolvedValue(createFetchResponse({ ok: true }));

    const { container } = renderDevice({
      userCode: 'ABCD-EFGH',
    });

    await waitFor(() => {
      expect(getVisibleInput(container)?.value).toBe('ABCD-EFGH');
    });

    const input = getVisibleInput(container);

    if (!input) {
      throw new Error('Expected visible device input to exist');
    }

    fireEvent.change(input, { target: { value: 'zx-90' } });
    await act(async () => {
      fireEvent.click(container.querySelector('button')!);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [, request] = fetchMock.mock.calls[0] ?? [];
    const requestBody = String(request?.body ?? '');

    expect(requestBody).toContain('user_code=ZX-90');
    expect(requestBody).toContain('confirm=yes');
  });

  it('keeps confirm mode when cleared and shows the local empty-code error', async () => {
    const { container, queryByText } = renderDevice({
      userCode: 'ABCD-EFGH',
    });

    await waitFor(() => {
      expect(getVisibleInput(container)?.value).toBe('ABCD-EFGH');
    });

    const input = getVisibleInput(container);

    if (!input) {
      throw new Error('Expected visible device input to exist');
    }

    fireEvent.change(input, { target: { value: '' } });

    expect(container.querySelector('button')!.disabled).toBe(false);

    await act(async () => {
      fireEvent.click(container.querySelector('button')!);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(queryByText('description.device_activation_error_description')).not.toBeNull();
  });
});
/* eslint-enable max-lines */
