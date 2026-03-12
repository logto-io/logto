import { experience } from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import Device from '.';
import DeviceSuccess from './Success';

const defaultAction = '/oidc/device/auth';
const defaultXsrf = 'foo';

const buildDeviceSearchParams = ({
  action = defaultAction,
  xsrf = defaultXsrf,
  error,
  inputCode,
  userCode,
}: {
  readonly action?: string;
  readonly xsrf?: string;
  readonly error?: string;
  readonly inputCode?: string;
  readonly userCode?: string;
}) => {
  const searchParams = new URLSearchParams({
    action,
    xsrf,
  });

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

const renderDevice = (options: {
  readonly action?: string;
  readonly xsrf?: string;
  readonly error?: string;
  readonly inputCode?: string;
  readonly userCode?: string;
}) =>
  renderWithPageContext(
    <SettingsProvider>
      <Device />
    </SettingsProvider>,
    {
      initialEntries: [`/device?${buildDeviceSearchParams(options).toString()}`],
    }
  );

const renderDeviceRoutes = (options: {
  readonly action?: string;
  readonly xsrf?: string;
  readonly error?: string;
  readonly inputCode?: string;
  readonly userCode?: string;
}) =>
  renderWithPageContext(
    <SettingsProvider>
      <Routes>
        <Route path={`/${experience.routes.device}`} element={<Device />} />
        <Route path={`/${experience.routes.device}/success`} element={<DeviceSuccess />} />
      </Routes>
    </SettingsProvider>,
    {
      initialEntries: [
        `/${experience.routes.device}?${buildDeviceSearchParams(options).toString()}`,
      ],
    }
  );

const getVisibleInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[name="device_user_code"]');

type MockFetchResponse = Pick<Response, 'ok' | 'redirected' | 'url'>;

const createFetchResponse = ({
  ok = true,
  redirected = false,
  url = 'http://localhost/oidc/device',
}: {
  readonly ok?: boolean;
  readonly redirected?: boolean;
  readonly url?: string;
}) => {
  const response: MockFetchResponse = {
    ok,
    redirected,
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

    expect(requestUrl).toBe(defaultAction);
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
