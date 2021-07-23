export function toTitle(string: string) {
  if (typeof string !== 'string') {
    throw new TypeError('Expected a string');
  }

  return string
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (x) => x.toUpperCase())
    .replace(/-/g, ' ');
}
