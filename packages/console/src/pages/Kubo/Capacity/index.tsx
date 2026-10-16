import { Theme } from '@logto/schemas';
import { useEffect, useRef } from 'react';

import useApi from '@/hooks/use-api';
import useTheme from '@/hooks/use-theme';

// The original kshows page, run unchanged (see ./kshows). Its script attaches its
// listeners and starts polling when it loads, so the markup must stay the same DOM
// node for the life of the page: it is created once and moved in and out on mount.
import markup from './kshows/markup.html?raw';
import style from './kshows/style.css?inline';
import tokens from './kshows/tokens.css?inline';

type KshowsWindow = Window & {
  kshowsSnapshot?: () => Promise<unknown>;
  kshowsStreamUrl?: string;
};

/* eslint-disable @silverhand/fp/no-mutation, @silverhand/fp/no-let -- the original kshows script is imperative DOM code: it owns this node and the window hook. */
const host = document.createElement('div');
host.className = 'kshows';
host.innerHTML = markup;

let booted = false;
/* eslint-enable @silverhand/fp/no-mutation, @silverhand/fp/no-let */

function Capacity() {
  const api = useApi();
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  useEffect(() => {
    host.dataset.theme = theme === Theme.Dark ? "dark" : "light";
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    /* eslint-disable-next-line @silverhand/fp/no-mutation -- the original script reads its data source from window. */
    (window as KshowsWindow).kshowsSnapshot = async () => api.get('api/kubo/kshows').json();
    container.append(host);

    if (!booted) {
      /* eslint-disable-next-line @silverhand/fp/no-mutation */
      booted = true;
      /* eslint-disable-next-line no-restricted-syntax -- the original script attaches to the DOM it finds at load. */
      void import('./kshows/app.js');
    }

    return () => {
      host.remove();
    };
  }, [api]);

  return (
    <>
      <style>{tokens + style}</style>
      <div ref={containerRef} />
    </>
  );
}

export default Capacity;
