/**
 * Align the Helm chart with the `@logto/core` version during `.scripts/version.js`.
 *
 * When the core version differs from the chart's `appVersion`, this script:
 *
 * 1. Pins the smoke test image to the outgoing `appVersion`, which is already published, since the
 *    new image does not exist until the release is tagged and dockerized;
 * 2. Sets `appVersion` to the core version;
 * 3. Bumps the patch of the chart's own `version`.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const chartDir = path.join(repoRoot, 'helm/logto');
const chartFile = path.join(chartDir, 'Chart.yaml');
const smokeValuesFile = path.join(chartDir, 'ci/smoke-values.yaml');

const { version: coreVersion } = JSON.parse(
  await readFile(path.join(repoRoot, 'packages/core/package.json'), 'utf8')
);

const getField = (content, key, file) => {
  const match = new RegExp(`^${key}: "?([^"\\s]+)"?$`, 'm').exec(content);
  if (!match) {
    throw new Error(`No top-level \`${key}\` found in ${file}`);
  }
  return match[1];
};

const setField = (content, key, value) =>
  content.replace(new RegExp(`^${key}: .*$`, 'm'), `${key}: ${value}`);

const chart = await readFile(chartFile, 'utf8');
const appVersion = getField(chart, 'appVersion', chartFile);

if (appVersion === coreVersion) {
  console.log(`Helm chart appVersion is already ${coreVersion}, skipping`);
  process.exit(0);
}

const chartVersion = getField(chart, 'version', chartFile);
const parts = /^(\d+)\.(\d+)\.(\d+)$/.exec(chartVersion);
if (!parts) {
  throw new Error(`Unsupported chart version ${chartVersion} in ${chartFile}`);
}
const nextChartVersion = `${parts[1]}.${parts[2]}.${Number(parts[3]) + 1}`;

const smokeValues = await readFile(smokeValuesFile, 'utf8');
const pinnedSmokeTag = /^ {2}tag: .*$/m;
if (!/^image:$/m.test(smokeValues) || !pinnedSmokeTag.test(smokeValues)) {
  throw new Error(`No \`image.tag\` found in ${smokeValuesFile}`);
}

await writeFile(smokeValuesFile, smokeValues.replace(pinnedSmokeTag, `  tag: "${appVersion}"`));
await writeFile(
  chartFile,
  setField(setField(chart, 'appVersion', `"${coreVersion}"`), 'version', nextChartVersion)
);

console.log(
  `Helm chart ${chartVersion} -> ${nextChartVersion}, appVersion ${appVersion} -> ${coreVersion}, smoke image ${appVersion}`
);
