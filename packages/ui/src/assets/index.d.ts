// FIXME: @simeng
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface SvgComponent extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module '@/assets/icons/*.svg' {
  const value: SvgComponent;
  export default value;
}
