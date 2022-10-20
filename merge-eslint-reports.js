const fs = require('fs');

const directories = fs.readdirSync('./packages');
const reports = directories
  // Filter out docs temporarily
  .filter((dir) => dir !== 'docs')
  .map((dir) => fs.readFileSync(`./packages/${dir}/report.json`, { encoding: 'utf-8' }));
const merged = [];

for (const report of reports) {
  merged.push(...JSON.parse(report));
}

fs.writeFileSync('./eslint_report.json', JSON.stringify(merged));
