interface SvgComponent extends React.FunctionComponent<React.SVGAttributes<SVGElement>> {}

declare module '*.svg' {
  const value: SvgComponent;
  export default value;
}
