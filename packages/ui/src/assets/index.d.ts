interface SvgComponent extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module '@/assets/icons/*.svg' {
  const value: SvgComponent;
  export default value;
}
