interface SvgComponent extends React.FunctionComponent<React.SVGAttributes<SVGElement>> {}

declare module '@/assets/icons/*.svg' {
  const value: SvgComponent;
  export default value;
}

declare module '@/shared/assets/icons/*.svg' {
  const value: SvgComponent;
  export default value;
}
