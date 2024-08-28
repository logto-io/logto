import { Theme } from '@logto/schemas';
import { noop, yes } from '@silverhand/essentials';
import { type Mermaid as MermaidType } from 'mermaid';
import { useEffect } from 'react';

import useTheme from '@/hooks/use-theme';

/**
 * Load Mermaid asynchronously from jsDelivr to avoid Parcel bundling issues. Parcel does not
 * bundle Mermaid correctly for production builds, so we need to load it dynamically from a CDN.
 */
const loadMermaid = async () => {
  // Define this variable to "outsmart" the detection of the dynamic import by Parcel:
  // https://github.com/parcel-bundler/parcel/issues/7064#issuecomment-942441649
  const uri = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const imported: { default: MermaidType } = await (process.env.NODE_ENV === 'development'
    ? // eslint-disable-next-line no-eval -- https://github.com/parcel-bundler/parcel/issues/8316
      eval(`import('${uri}')`)
    : import(uri));
  return imported.default;
};

const mermaidPromise = yes(process.env.INTEGRATION_TEST)
  ? // Mock Mermaid in integration tests to avoid issues with network requests and testing environment.
    Promise.resolve({
      initialize: noop,
      run: noop,
    })
  : loadMermaid();

type Props = {
  readonly children: string;
};

const themeToMermaidTheme = Object.freeze({
  [Theme.Dark]: 'dark',
  [Theme.Light]: 'default',
} satisfies Record<Theme, string>);

export default function Mermaid({ children }: Props) {
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      const mermaid = await mermaidPromise;
      mermaid.initialize({
        startOnLoad: false,
        theme: themeToMermaidTheme[theme],
        securityLevel: 'loose',
      });
      await mermaid.run();
    })();
  }, [theme]);

  return <div className="mermaid">{children}</div>;
}
