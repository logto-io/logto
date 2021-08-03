module.exports = {
  '*.ts?(x)': ['eslint --format pretty --cache --fix', () => 'tsc -p tsconfig.json --noEmit'],
  '*.scss': 'stylelint --fix',
};
