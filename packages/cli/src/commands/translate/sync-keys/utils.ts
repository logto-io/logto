import { readFileSync, existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { trySafe } from '@silverhand/essentials';
import ts from 'typescript';

import { consoleLog } from '../../../utils.js';

type FileStructure = {
  [key: string]: { filePath: string; structure: FileStructure };
};

type NestedPhraseObject = {
  [key: string]: string | NestedPhraseObject;
};

type ParsedTuple = readonly [NestedPhraseObject, FileStructure];

/**
 * Given a entrypoint file path of a language, parse the nested object of
 * phrases and the file structure.
 *
 * @example
 * Given the following file:
 *
 * ```ts
 * import errors from './errors/index.js';
 *
 * const translation = {
 *   page_title: 'Anwendungen',
 *   errors,
 * };
 * ```
 *
 * The returned object will be:
 *
 * ```ts
 * {
 *   page_title: 'Anwendungen',
 *   errors: {
 *     page_not_found: 'Seite nicht gefunden',
 *   },
 * }
 * ```
 *
 * And the file structure will be:
 *
 * ```ts
 * {
 *   errors: {
 *     filePath: './errors/index.js',
 *     structure: {},
 *   },
 * }
 * ```
 *
 * @param filePath The entrypoint file path of a language
 *
 * @returns A tuple of the nested object of phrases and the file structure
 *
 */
export const praseLocaleFiles = (filePath: string): ParsedTuple => {
  const content = readFileSync(filePath, 'utf8');
  const ast = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const importIdentifierPath = new Map<string, string>();

  const traverseNode = (
    node: ts.Node,
    nestedObject: NestedPhraseObject,
    fileStructure: FileStructure
  ) => {
    if (ts.isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier.getText().slice(1, -1).replace('.js', '.ts');
      const importIdentifier = node.importClause?.getText();

      // Assuming only default import is used
      if (importIdentifier) {
        importIdentifierPath.set(importIdentifier, importPath);
      }
    } else if (ts.isObjectLiteralExpression(node)) {
      for (const property of node.properties) {
        // Treat shorthand property assignment as import
        if (ts.isShorthandPropertyAssignment(property)) {
          const key = property.name.getText();
          const importPath = importIdentifierPath.get(key);

          if (!importPath) {
            consoleLog.fatal(`Cannot find import path for ${key} in ${filePath}`);
          }

          const resolvedPath = path.resolve(path.dirname(filePath), importPath);

          // Recursively parse the nested object from the imported file
          const [phrases, structure] = praseLocaleFiles(resolvedPath);

          // eslint-disable-next-line @silverhand/fp/no-mutation
          nestedObject[key] = phrases;
          // eslint-disable-next-line @silverhand/fp/no-mutation
          fileStructure[key] = {
            filePath: importPath,
            structure,
          };
        }

        if (ts.isPropertyAssignment(property)) {
          const key = property.name.getText();
          const value = property.initializer.getText();

          // eslint-disable-next-line @silverhand/fp/no-mutation
          nestedObject[key] = value;
        }
      }
    } else {
      node.forEachChild((child) => {
        traverseNode(child, nestedObject, fileStructure);
      });
    }

    return [nestedObject, fileStructure] as const;
  };

  return traverseNode(ast, {}, {});
};

const getIdentifier = (filePath: string) => {
  const filename = path.basename(filePath, '.ts');
  return (filename === 'index' ? path.basename(path.dirname(filePath)) : filename).replaceAll(
    '-',
    '_'
  );
};

/**
 * Recursively traverse the nested object of phrases and the file structure of
 * the baseline language, and generate the target language directory with the
 * same file structure.
 *
 * Values of the nested object will be replaced with the values of the target
 * language if the key exists; otherwise, the value of the baseline language
 * will be used.
 *
 * @param baseline The baseline language tuple
 * @param targetObject The target language nested object
 * @param targetFilePath The target language entrypoint file path
 */
/* eslint-disable no-await-in-loop */
const traverseNode = async (
  baseline: ParsedTuple,
  targetObject: NestedPhraseObject,
  targetFilePath: string
) => {
  const [, baselineStructure] = baseline;
  const targetDirectory = path.dirname(targetFilePath);

  await fs.mkdir(targetDirectory, { recursive: true });
  await fs.writeFile(targetFilePath, '', { flag: 'w+' });

  // Write imports first
  const baselineEntries = Object.entries(baselineStructure);
  for (const [key, value] of baselineEntries
    .slice()
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))) {
    const importPath = path.join(targetDirectory, value.filePath);
    await fs.appendFile(
      targetFilePath,
      `import ${key} from './${path
        .relative(targetDirectory, importPath)
        .replace('.ts', '.js')}';\n`
    );
  }

  // Add a newline between imports and the object
  if (baselineEntries.length > 0) {
    await fs.appendFile(targetFilePath, '\n');
  }

  // Write the object
  const identifier = getIdentifier(targetFilePath);
  await fs.appendFile(targetFilePath, `const ${identifier} = {\n`);

  // Recursively traverse the nested object of phrases and the file structure
  // of the baseline language
  const traverseObject = async (
    baseline: ParsedTuple,
    targetObject: NestedPhraseObject,
    tabSize: number
  ) => {
    const [baselineObject, baselineStructure] = baseline;

    for (const [key, value] of Object.entries(baselineObject)) {
      const existingValue = targetObject[key];

      if (typeof value === 'string') {
        // If the key exists in the target language and the value is a string, use
        // the value of the target language; otherwise, use the value of the
        // baseline language and add a comment to indicate that the phrase is
        // untranslated to help identify missing translations.
        await (typeof existingValue === 'string'
          ? fs.appendFile(targetFilePath, `${' '.repeat(tabSize)}${key}: ${existingValue},\n`)
          : fs.appendFile(
              targetFilePath,
              `${' '.repeat(tabSize)}${key}: '${value}', // UNTRANSLATED\n`
            ));
      } else {
        const keyStructure = baselineStructure[key];

        // If the key has a file structure, treat it as an import; otherwise,
        // treat it as a nested object.
        if (keyStructure) {
          await fs.appendFile(targetFilePath, `${' '.repeat(tabSize)}${key},\n`);

          await traverseNode(
            [value, keyStructure.structure],
            typeof existingValue === 'object' ? existingValue : {},
            path.join(targetDirectory, keyStructure.filePath)
          );

          throw new Error('Should not reach here');
        } else {
          await fs.appendFile(targetFilePath, `${' '.repeat(tabSize)}${key}: {\n`);
          await traverseObject([value, {}], {}, tabSize + 2);
          await fs.appendFile(targetFilePath, `${' '.repeat(tabSize)}}\n`);
        }
      }
    }
  };

  await traverseObject(baseline, targetObject, 2);

  await fs.appendFile(targetFilePath, '};\n\n');
  await fs.appendFile(targetFilePath, `export default ${identifier};\n`);
};
/* eslint-enable no-await-in-loop */

export const syncPhraseKeysAndFileStructure = async (
  baseline: ParsedTuple,
  targetLocale: string,
  targetDirectory: string
) => {
  const targetEntrypoint = path.join(targetDirectory, 'index.ts');
  const isTargetLocaleExist = existsSync(targetEntrypoint);
  const targetObject = isTargetLocaleExist ? praseLocaleFiles(targetEntrypoint)[0] : {};
  const backupDirectory = targetDirectory + '.bak';

  if (isTargetLocaleExist) {
    await fs.rename(targetDirectory, backupDirectory);
  } else {
    consoleLog.warn(`Cannot find ${targetLocale} entrypoint, creating one`);
  }

  await trySafe(
    traverseNode(baseline, targetObject, path.join(targetDirectory, 'index.ts')),
    (error) => {
      consoleLog.plain();
      consoleLog.error(error);
      consoleLog.plain();
      consoleLog.fatal(
        `Failed to sync keys for ${targetLocale}, the backup is at ${backupDirectory} for recovery`
      );
    }
  );

  if (isTargetLocaleExist) {
    await fs.rm(backupDirectory, { recursive: true });
  }
};
