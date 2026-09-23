import wasmUrl from '@cap.js/wasm/browser/cap_wasm_bg.wasm?url';

export const capWidgetTagName = 'cap-widget';

type CapWidgetElement = HTMLElement & {
  // eslint-disable-next-line @typescript-eslint/ban-types -- The widget uses `null` for no token
  readonly token: string | null;
  solve: () => Promise<{ success: boolean; token: string } | undefined>;
  reset: () => void;
};

/** Read a string field from the `detail` of a Cap widget `CustomEvent`. */
const getEventDetail = (event: Event, key: string): string | undefined => {
  const detail: unknown = event instanceof CustomEvent ? event.detail : undefined;

  if (typeof detail === 'object' && detail !== null && key in detail) {
    const value: unknown = Object.getOwnPropertyDescriptor(detail, key)?.value;
    return typeof value === 'string' ? value : undefined;
  }
};

/**
 * Load the bundled Cap widget, which registers the `<cap-widget>` custom element. The solver
 * WebAssembly is served by the experience app itself instead of the default CDN, so the widget
 * keeps working where the CDN is unreachable.
 */
export const loadCapWidget = async () => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  window.CAP_CUSTOM_WASM_URL = wasmUrl;
  await import('cap-widget');
};

/**
 * Get a single-use token from the Cap widget in the given container, solving the challenge if the
 * user has not done it yet. The widget is reset once the token is taken, since the token will be
 * consumed by the server-side verification and cannot be reused for the next submission.
 *
 * The result is taken from the widget events instead of the `solve()` return value, since
 * `solve()` resolves to `undefined` when a solve (e.g. triggered by the user clicking the widget)
 * is already in progress.
 */
export const solveCapWidget = async (container: HTMLElement) =>
  new Promise<string>((resolve, reject) => {
    const widget = container.querySelector<CapWidgetElement>(capWidgetTagName);

    if (!widget) {
      reject(new Error('Cap widget is not rendered'));
      return;
    }

    const takeToken = (token: string) => {
      // Deferred since the widget updates its own state right after dispatching the `solve` event
      setTimeout(() => {
        widget.reset();
      }, 0);
      resolve(token);
    };

    if (widget.token) {
      takeToken(widget.token);
      return;
    }

    const cleanup = () => {
      widget.removeEventListener('solve', onSolve);
      widget.removeEventListener('error', onError);
    };

    function onSolve(event: Event) {
      cleanup();
      const token = getEventDetail(event, 'token');

      if (token) {
        takeToken(token);
      } else {
        reject(new Error('Cap widget is solved without a token'));
      }
    }

    function onError(event: Event) {
      cleanup();
      reject(new Error(`Cap error: ${getEventDetail(event, 'message') ?? 'unknown'}`));
    }

    widget.addEventListener('solve', onSolve);
    widget.addEventListener('error', onError);

    // Errors are reported through the `error` event
    void (async () => {
      try {
        await widget.solve();
      } catch {}
    })();
  });
