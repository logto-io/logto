interface SvgComponent extends React.FunctionComponent<React.SVGAttributes<SVGElement>> {}

declare module '*.svg' {
  const value: SvgComponent;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}
