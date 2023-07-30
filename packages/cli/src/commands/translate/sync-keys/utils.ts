import fs from 'node:fs';
import path from 'node:path';

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
  const content = fs.readFileSync(filePath, 'utf8');
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

          consoleLog.warn(key, importPath);

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

const traverseNode = (
  baseline: ParsedTuple,
  targetObject: NestedPhraseObject,
  targetFilePath: string
) => {
  const [, baselineStructure] = baseline;
  const targetDirectory = path.dirname(targetFilePath);

  fs.mkdirSync(targetDirectory, { recursive: true });
  fs.writeFileSync(targetFilePath, '', { flag: 'w+' });

  const baselineEntries = Object.entries(baselineStructure);

  for (const [key, value] of baselineEntries
    .slice()
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))) {
    const importPath = path.join(targetDirectory, value.filePath);
    fs.appendFileSync(
      targetFilePath,
      `import ${key} from './${path
        .relative(targetDirectory, importPath)
        .replace('.ts', '.js')}';\n`
    );
  }

  if (baselineEntries.length > 0) {
    fs.appendFileSync(targetFilePath, '\n');
  }

  const identifier = getIdentifier(targetFilePath);
  fs.appendFileSync(targetFilePath, `const ${identifier} = {\n`);

  const traverseObject = (
    baseline: ParsedTuple,
    targetObject: NestedPhraseObject,
    tabSize: number
  ) => {
    const [baselineObject, baselineStructure] = baseline;

    for (const [key, value] of Object.entries(baselineObject)) {
      const existingValue = targetObject[key];

      if (typeof value === 'string') {
        const targetValue = typeof existingValue === 'string' ? existingValue : value;

        fs.appendFileSync(targetFilePath, `${' '.repeat(tabSize)}${key}: ${targetValue},\n`);
      } else {
        const keyStructure = baselineStructure[key];

        if (keyStructure) {
          fs.appendFileSync(targetFilePath, `${' '.repeat(tabSize)}${key},\n`);

          traverseNode(
            [value, keyStructure.structure],
            typeof existingValue === 'object' ? existingValue : {},
            path.join(targetDirectory, keyStructure.filePath)
          );
        } else {
          fs.appendFileSync(targetFilePath, `${' '.repeat(tabSize)}${key}: {\n`);
          traverseObject([value, {}], {}, tabSize + 2);
          fs.appendFileSync(targetFilePath, `${' '.repeat(tabSize)}}\n`);
        }
      }
    }
  };

  traverseObject(baseline, targetObject, 2);

  fs.appendFileSync(targetFilePath, '};\n\n');
  fs.appendFileSync(targetFilePath, `export default ${identifier};\n`);
};

export const syncPhraseKeysAndFileStructure = (
  baseline: ParsedTuple,
  target: NestedPhraseObject,
  targetDirectory: string
) => {
  fs.renameSync(targetDirectory, targetDirectory + '.bak');
  fs.mkdirSync(targetDirectory);

  traverseNode(baseline, target, path.join(targetDirectory, 'index.ts'));
};
