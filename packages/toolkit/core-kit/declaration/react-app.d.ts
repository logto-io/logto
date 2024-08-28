// Copied from react-scripts/lib/react-app.d.ts

declare module '*.avif' {
  const source: string;
  export default source;
}

declare module '*.bmp' {
  const source: string;
  export default source;
}

declare module '*.gif' {
  const source: string;
  export default source;
}

declare module '*.jpg' {
  const source: string;
  export default source;
}

declare module '*.jpeg' {
  const source: string;
  export default source;
}

declare module '*.png' {
  const source: string;
  export default source;
}

declare module '*.webp' {
  const source: string;
  export default source;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const source: string;
  export default source;
}

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
  export = classes;
}

declare module '*.module.scss' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
  export = classes;
}

declare module '*.module.sass' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
  export = classes;
}
