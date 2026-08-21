import { useSyncExternalStore } from 'react';

declare global {
  // Declaration merging into the DOM lib requires an interface.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Document {
    /**
     * Not in TypeScript's DOM lib yet.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/prerendering | MDN}
     */
    readonly prerendering?: boolean;
  }
}

const isPrerendering = () => Boolean(document.prerendering);

const subscribe = (onStoreChange: () => void) => {
  document.addEventListener('prerenderingchange', onStoreChange);
  return () => {
    document.removeEventListener('prerenderingchange', onStoreChange);
  };
};

/**
 * Returns whether the page is being prerendered (e.g. Chrome address-bar preloading).
 *
 * One-time side effects (consuming a social callback's code and state, aborting an interaction)
 * must not run during prerendering: the prerendered page may never be shown to the user, but
 * its network requests do reach the server. Gate such effects on this hook — it flips to
 * `false` when the page is activated.
 */
const usePrerendering = () => useSyncExternalStore(subscribe, isPrerendering);

export default usePrerendering;
