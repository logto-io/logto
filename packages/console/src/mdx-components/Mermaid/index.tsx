import { Theme } from '@logto/schemas';
import { useEffect } from 'react';

import useTheme from '@/hooks/use-theme';

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
      const { default: mermaid } = await import('mermaid');

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
