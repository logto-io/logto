module.exports = {
  '*.ts?(x)': ['yarn lint --fix', () => 'tsc -p tsconfig.json --noEmit'],
};
