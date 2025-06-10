/**
 * Test file for deepSort and autoCompare functions from compare-database.js
 * 
 * Usage: node .scripts/compare-database.test.js
 * 
 * This file tests the deep sorting functionality that ensures consistent
 * ordering of arrays and objects in database comparison operations.
 */

import assert from 'node:assert';
import { autoCompare, deepSort, normalizeDefinition } from './compare-database.js';

// Test helper function
const runTest = (testName, testFn) => {
  try {
    testFn();
    console.log(`${testName}`);
  } catch (error) {
    console.error(`${testName}: ${error.message}`);
    process.exit(1);
  }
};

// Test cases for autoCompare function
runTest('autoCompare - different types', () => {
  assert.strictEqual(autoCompare('string', 123) > 0, true); // string > number
  assert.strictEqual(autoCompare(123, 'string') < 0, true); // number < string
});

runTest('autoCompare - same primitive types', () => {
  assert.strictEqual(autoCompare('apple', 'banana') < 0, true);
  assert.strictEqual(autoCompare('banana', 'apple') > 0, true);
  assert.strictEqual(autoCompare('apple', 'apple'), 0);
  assert.strictEqual(autoCompare(1, 2) < 0, true);
  assert.strictEqual(autoCompare(2, 1) > 0, true);
  assert.strictEqual(autoCompare(1, 1), 0);
});

runTest('autoCompare - objects', () => {
  const obj1 = { a: 1, b: 2 };
  const obj2 = { a: 1, b: 2 };
  const obj3 = { a: 1, b: 3 };
  
  assert.strictEqual(autoCompare(obj1, obj2), 0);
  assert.strictEqual(autoCompare(obj1, obj3) < 0, true);
  assert.strictEqual(autoCompare(obj3, obj1) > 0, true);
});

// Test cases for deepSort function
runTest('deepSort - primitive values', () => {
  assert.strictEqual(deepSort('hello'), 'hello');
  assert.strictEqual(deepSort(123), 123);
  assert.strictEqual(deepSort(null), null);
  assert.strictEqual(deepSort(undefined), undefined);
});

runTest('deepSort - simple arrays', () => {
  const input = [3, 1, 2];
  const expected = [1, 2, 3];
  const result = deepSort(input);
  
  assert.deepStrictEqual(result, expected);
});

runTest('deepSort - string arrays', () => {
  const input = ['banana', 'apple', 'cherry'];
  const expected = ['apple', 'banana', 'cherry'];
  const result = deepSort(input);
  
  assert.deepStrictEqual(result, expected);
});

runTest('deepSort - nested arrays', () => {
  const input = [[3, 1], [2, 4], [1, 2]];
  const expected = [[1, 2], [1, 3], [2, 4]];
  const result = deepSort(input);
  
  assert.deepStrictEqual(result, expected);
});

runTest('deepSort - simple objects', () => {
  const input = { c: 3, a: 1, b: 2 };
  const expected = { a: 1, b: 2, c: 3 };
  const result = deepSort(input);
  
  assert.deepStrictEqual(result, expected);
});

runTest('deepSort - objects with arrays', () => {
  const input = {
    name: 'test',
    items: [3, 1, 2],
    tags: ['beta', 'alpha']
  };
  const expected = {
    items: [1, 2, 3],
    name: 'test',
    tags: ['alpha', 'beta']
  };
  const result = deepSort(input);
  
  assert.deepStrictEqual(result, expected);
});

runTest('deepSort - arrays with objects', () => {
  const input = [
    { name: 'Bob', age: 25 },
    { name: 'Alice', age: 30 },
    { name: 'Charlie', age: 20 }
  ];
  // Objects are sorted by their keys and values in lexicographic order
  // First by 'age' key, then by 'name' key
  const expected = [
    { age: 20, name: 'Charlie' },
    { age: 25, name: 'Bob' },
    { age: 30, name: 'Alice' }
  ];
  const result = deepSort(input);
  
  assert.deepStrictEqual(result, expected);
});

runTest('deepSort - arrays with nested objects', () => {
  const input1 = {
    logto_skus: [
      { type: 'AddOn', quota: { tokenLimit: 10_000 }, is_default: false },
      { type: 'AddOn', quota: { tokenLimit: 100 }, is_default: true },
      { type: 'AddOn', quota: { enterpriseSsoLimit: null }, is_default: true },
    ],
  };
  
  const input2 = {
    logto_skus: [
      { type: 'AddOn', quota: { enterpriseSsoLimit: null }, is_default: true },
      { quota: { tokenLimit: 10_000 }, is_default: false, type: 'AddOn' },
      { type: 'AddOn', quota: { tokenLimit: 100 }, is_default: true },
    ],
  };
  
  // Expected order based on sorting logic:
  // 1. First by is_default: false < true
  // 2. Then by quota keys: enterpriseSsoLimit < tokenLimit (alphabetical)
  // 3. Then by quota values and other properties
  const expected = {
    logto_skus: [
      { is_default: false, quota: { tokenLimit: 10_000 }, type: 'AddOn' },
      { is_default: true, quota: { enterpriseSsoLimit: null }, type: 'AddOn' },
      { is_default: true, quota: { tokenLimit: 100 }, type: 'AddOn' },
    ],
  };
  
  assert.deepStrictEqual(deepSort(input1), expected);
  assert.deepStrictEqual(deepSort(input2), expected);
});

runTest('deepSort - complex nested structure', () => {
  const input = {
    users: [
      {
        name: 'Bob',
        roles: ['admin', 'user'],
        metadata: { created: '2023-01-01', active: true }
      },
      {
        name: 'Alice',
        roles: ['user', 'editor'],
        metadata: { created: '2023-01-02', active: false }
      }
    ],
    config: {
      version: '1.0',
      features: ['auth', 'logging', 'api']
    }
  };
  
  const expected = {
    config: {
      features: ['api', 'auth', 'logging'],
      version: '1.0'
    },
    users: [
      {
        metadata: { active: false, created: '2023-01-02' },
        name: 'Alice',
        roles: ['editor', 'user']
      },
      {
        metadata: { active: true, created: '2023-01-01' },
        name: 'Bob',
        roles: ['admin', 'user']
      }
    ]
  };
  
  const result = deepSort(input);
  assert.deepStrictEqual(result, expected);
});

runTest('deepSort - empty structures', () => {
  assert.deepStrictEqual(deepSort([]), []);
  assert.deepStrictEqual(deepSort({}), {});
  // Empty array comes before empty object in autoCompare logic
  assert.deepStrictEqual(deepSort([[], {}]), [[], {}]);
});

runTest('deepSort - mixed types in array', () => {
  const input = [{ b: 2 }, 'string', 1, { a: 1 }];
  // Type order in autoCompare: number < object < string
  // Objects are sorted by their content
  const expected = [1, { a: 1 }, { b: 2 }, 'string'];
  const result = deepSort(input);
  
  assert.deepStrictEqual(result, expected);
});

// Test cases for normalizeDefinition function
runTest('normalizeDefinition - single line without leading/trailing spaces', () => {
  const input = 'CREATE FUNCTION test() RETURNS void';
  const expected = 'CREATE FUNCTION test() RETURNS void';
  const result = normalizeDefinition(input);
  
  assert.strictEqual(result, expected);
});

runTest('normalizeDefinition - single line with leading/trailing spaces', () => {
  const input = '  CREATE FUNCTION test() RETURNS void  ';
  const expected = 'CREATE FUNCTION test() RETURNS void';
  const result = normalizeDefinition(input);
  
  assert.strictEqual(result, expected);
});

runTest('normalizeDefinition - multi-line with various indentation', () => {
  const input = `CREATE OR REPLACE FUNCTION test_function()
    RETURNS trigger
    LANGUAGE plpgsql
  AS $function$
    BEGIN
      IF NEW.status IS NULL THEN
        NEW.status := 'active';
      END IF;
      RETURN NEW;
    END;
  $function$`;
  
  const expected = `CREATE OR REPLACE FUNCTION test_function()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
IF NEW.status IS NULL THEN
NEW.status := 'active';
END IF;
RETURN NEW;
END;
$function$`;
  
  const result = normalizeDefinition(input);
  assert.strictEqual(result, expected);
});

runTest('normalizeDefinition - trigger action statement', () => {
  const input = `  BEGIN
    UPDATE table1 SET updated_at = NOW() WHERE id = NEW.id;
    INSERT INTO audit_log (table_name, action) VALUES ('table1', 'UPDATE');
      RETURN NEW;
  END  `;
  
  const expected = `BEGIN
UPDATE table1 SET updated_at = NOW() WHERE id = NEW.id;
INSERT INTO audit_log (table_name, action) VALUES ('table1', 'UPDATE');
RETURN NEW;
END`;
  
  const result = normalizeDefinition(input);
  assert.strictEqual(result, expected);
});

runTest('normalizeDefinition - empty lines and mixed spacing', () => {
  const input = `  CREATE FUNCTION complex_func()

    RETURNS TABLE(id integer, name text)
  AS $$
    SELECT id, name
      FROM users
        WHERE active = true;
  $$`;
  
  const expected = `CREATE FUNCTION complex_func()

RETURNS TABLE(id integer, name text)
AS $$
SELECT id, name
FROM users
WHERE active = true;
$$`;
  
  const result = normalizeDefinition(input);
  assert.strictEqual(result, expected);
});

runTest('normalizeDefinition - non-string input', () => {
  assert.strictEqual(normalizeDefinition(null), null);
  assert.strictEqual(normalizeDefinition(undefined), undefined);
  assert.strictEqual(normalizeDefinition(123), 123);
  assert.deepStrictEqual(normalizeDefinition({ key: 'value' }), { key: 'value' });
});

runTest('normalizeDefinition - empty string', () => {
  assert.strictEqual(normalizeDefinition(''), '');
  assert.strictEqual(normalizeDefinition('   '), '');
});
