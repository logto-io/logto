import color from 'color';

// Color hsl lighten/darken takes percentage value only, need to implement absolute value update
export const absoluteLighten = (baseColor: color, delta: number) => {
  const hslArray = baseColor.hsl().round().array() as [number, number, number];

  return color([hslArray[0], hslArray[1], hslArray[2] + delta], 'hsl');
};

export const absoluteDarken = (baseColor: color, delta: number) => {
  const hslArray = baseColor.hsl().round().array() as [number, number, number];

  return color([hslArray[0], hslArray[1], hslArray[2] - delta], 'hsl');
};
