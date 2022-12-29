export default {
  '*.ts?(x)': ['eslint --cache --fix', () => 'tsc -p tsconfig.json --noEmit'],
  '*.scss': 'stylelint --fix',
};
