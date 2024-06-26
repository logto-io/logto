import { Theme } from '@logto/schemas';
import mermaid from 'mermaid';
import { useEffect } from 'react';

import useTheme from '@/hooks/use-theme';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  themeCSS: `
    g.classGroup rect {
      fill: #282a36;
      stroke: #6272a4;
    } 
    g.classGroup text {
      fill: #f8f8f2;
    }
    g.classGroup line {
      stroke: #f8f8f2;
      stroke-width: 0.5;
    }
    .classLabel .box {
      stroke: #21222c;
      stroke-width: 3;
      fill: #21222c;
      opacity: 1;
    }
    .classLabel .label {
      fill: #f1fa8c;
    }
    .relation {
      stroke: #ff79c6;
      stroke-width: 1;
    }
    #compositionStart, #compositionEnd {
      fill: #bd93f9;
      stroke: #bd93f9;
      stroke-width: 1;
    }
    #aggregationEnd, #aggregationStart {
      fill: #21222c;
      stroke: #50fa7b;
      stroke-width: 1;
    }
    #dependencyStart, #dependencyEnd {
      fill: #00bcd4;
      stroke: #00bcd4;
      stroke-width: 1;
    } 
    #extensionStart, #extensionEnd {
      fill: #f8f8f2;
      stroke: #f8f8f2;
      stroke-width: 1;
    }`,
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
