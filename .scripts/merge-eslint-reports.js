import fs from 'fs';

const directories = [
  ...fs.readdirSync('./packages'),
  ...fs.readdirSync('./packages/toolkit').map((dir) => 'toolkit/' + dir),
];
const reports = directories
  // Filter out unavailable paths
  .filter((dir) => !['create', 'toolkit', 'connectors'].includes(dir) && !dir.includes('.'))
  .map((dir) => fs.readFileSync(`./packages/${dir}/report.json`, { encoding: 'utf-8' }));
const merged = [];

for (const report of reports) {
  merged.push(...JSON.parse(report));
}

fs.writeFileSync('./eslint_report.json', JSON.stringify(merged));
