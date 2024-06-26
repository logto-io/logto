import { Theme } from '@logto/schemas';
import mermaid from 'mermaid';
import { useEffect } from 'react';

import useTheme from '@/hooks/use-theme';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Fira Code',
});

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
    mermaid.initialize({
      theme: themeToMermaidTheme[theme],
    });
  }, [theme]);

  useEffect(() => {
    mermaid.contentLoaded();
  }, []);

  return <div className="mermaid">{children}</div>;
}
