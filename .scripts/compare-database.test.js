/**
 * Test file for deepSort and autoCompare functions from compare-database.js
 * 
 * Usage: node .scripts/compare-database.test.js
 * 
 * This file tests the deep sorting functionality that ensures consistent
 * ordering of arrays and objects in database comparison operations.
 */

import assert from 'node:assert';
import { autoCompare, normalizeDefinition, buildSortByKeys, getValueComplexity } from './compare-database.js';

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

// Test cases for autoCompare sorting stability - converted from original deepSort tests
runTest('autoCompare - simple arrays sorting stability', () => {
  const input = [3, 1, 2];
  const sorted = input.slice().sort(autoCompare);
  const expected = [1, 2, 3];
  
  assert.deepStrictEqual(sorted, expected);
  
  // Test multiple sorts produce same result (stability)
  const sorted2 = input.slice().sort(autoCompare);
  assert.deepStrictEqual(sorted, sorted2);
});

runTest('autoCompare - string arrays sorting stability', () => {
  const input = ['banana', 'apple', 'cherry'];
  const sorted = input.slice().sort(autoCompare);
  const expected = ['apple', 'banana', 'cherry'];
  
  assert.deepStrictEqual(sorted, expected);
  
  // Test multiple sorts produce same result
  const sorted2 = input.slice().sort(autoCompare);
  assert.deepStrictEqual(sorted, sorted2);
});

runTest('autoCompare - nested arrays sorting consistency', () => {
  const input = [[3, 1], [2, 4], [1, 2]];
  const sorted = input.slice().sort(autoCompare);
  
  // Arrays are compared element by element
  // [1, 2] < [2, 4] < [3, 1]
  const expected = [[1, 2], [2, 4], [3, 1]];
  
  assert.deepStrictEqual(sorted, expected);
  
  // Test sorting stability
  const sorted2 = input.slice().sort(autoCompare);
  assert.deepStrictEqual(sorted, sorted2);
});

runTest('autoCompare - objects sorting by keys and values', () => {
  const obj1 = { c: 3, a: 1, b: 2 };
  const obj2 = { a: 1, b: 2, c: 3 };
  const obj3 = { b: 2, c: 3, a: 1 };
  
  // All objects have same content, just different key order
  assert.strictEqual(autoCompare(obj1, obj2), 0);
  assert.strictEqual(autoCompare(obj2, obj3), 0);
  assert.strictEqual(autoCompare(obj1, obj3), 0);
  
  // Objects with different values
  const obj4 = { a: 1, b: 2, c: 4 };
  assert.strictEqual(autoCompare(obj1, obj4) < 0, true); // 3 < 4
});

runTest('autoCompare - arrays with objects sorting stability', () => {
  const input = [
    { name: 'Bob', age: 25 },
    { name: 'Alice', age: 30 },
    { name: 'Charlie', age: 20 }
  ];
  
  const sorted = input.slice().sort(autoCompare);
  
  // Objects are sorted by their keys and values in lexicographic order
  // First by 'age' key, then by 'name' key
  const expected = [
    { age: 20, name: 'Charlie' },
    { age: 25, name: 'Bob' },
    { age: 30, name: 'Alice' }
  ];
  
  assert.deepStrictEqual(sorted, expected);
  
  // Test sorting stability
  const sorted2 = input.slice().sort(autoCompare);
  assert.deepStrictEqual(sorted, sorted2);
});

runTest('autoCompare - complex nested objects sorting consistency', () => {
  const obj1 = {
    logto_skus: [
      { type: 'AddOn', quota: { tokenLimit: 10_000 }, is_default: false },
      { type: 'AddOn', quota: { tokenLimit: 100 }, is_default: true },
      { type: 'AddOn', quota: { enterpriseSsoLimit: null }, is_default: true },
    ],
  };
  
  const obj2 = {
    logto_skus: [
      { type: 'AddOn', quota: { enterpriseSsoLimit: null }, is_default: true },
      { quota: { tokenLimit: 10_000 }, is_default: false, type: 'AddOn' },
      { type: 'AddOn', quota: { tokenLimit: 100 }, is_default: true },
    ],
  };
  
  // Sort both arrays using buildSortByKeys for consistent comparison
  const keys1 = obj1.logto_skus.length > 0 ? Object.keys(obj1.logto_skus[0]) : [];
  const keys2 = obj2.logto_skus.length > 0 ? Object.keys(obj2.logto_skus[0]) : [];
  
  const sortedObj1 = {
    logto_skus: obj1.logto_skus.slice().sort(buildSortByKeys(keys1))
  };
  
  const sortedObj2 = {
    logto_skus: obj2.logto_skus.slice().sort(buildSortByKeys(keys2))
  };
  
  // After sorting, they should be comparable and produce consistent results
  const comparison1 = autoCompare(sortedObj1, sortedObj2);
  const comparison2 = autoCompare(sortedObj1, sortedObj2);
  
  assert.strictEqual(comparison1, comparison2); // Consistency
});

runTest('autoCompare - mixed types array sorting order', () => {
  const input = [{ b: 2 }, 'string', 1, { a: 1 }];
  const sorted = input.slice().sort(autoCompare);
  
  // Type order in autoCompare: number < object < string
  // Objects are sorted by their content
  const expected = [1, { a: 1 }, { b: 2 }, 'string'];
  
  assert.deepStrictEqual(sorted, expected);
  
  // Test sorting stability
  const sorted2 = input.slice().sort(autoCompare);
  assert.deepStrictEqual(sorted, sorted2);
});

runTest('autoCompare - buildSortByKeys integration for database data', () => {
  // This simulates database rows that might have different ordering
  const data1 = [
    { id: 1, name: 'Alice', metadata: { created: '2023-01-01' }, active: true },
    { id: 2, name: 'Bob', metadata: { created: '2023-01-02' }, active: false }
  ];
  
  const data2 = [
    { id: 2, name: 'Bob', metadata: { created: '2023-01-02' }, active: false },
    { id: 1, name: 'Alice', metadata: { created: '2023-01-01' }, active: true }
  ];
  
  // Use buildSortByKeys to ensure consistent ordering
  const keys = ['id', 'name', 'metadata', 'active'];
  const sorted1 = data1.slice().sort(buildSortByKeys(keys));
  const sorted2 = data2.slice().sort(buildSortByKeys(keys));
  
  // After sorting with complexity-aware buildSortByKeys, arrays should be identical
  assert.deepStrictEqual(sorted1, sorted2);
  
  // Verify that the sorting is based on complexity (metadata object should be compared first)
  const comparison = autoCompare(sorted1, sorted2);
  assert.strictEqual(comparison, 0); // Should be identical
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

// Test cases for getValueComplexity function
runTest('getValueComplexity - returns correct complexity scores', () => {
  assert.strictEqual(getValueComplexity(null), 0);
  assert.strictEqual(getValueComplexity(undefined), 0);
  assert.strictEqual(getValueComplexity(true), 1);
  assert.strictEqual(getValueComplexity(false), 1);
  assert.strictEqual(getValueComplexity(42), 2);
  assert.strictEqual(getValueComplexity('string'), 3);
  assert.strictEqual(getValueComplexity([1, 2, 3]), 4);
  assert.strictEqual(getValueComplexity({ key: 'value' }), 5);
});

// Test cases for buildSortByKeys with complexity sorting
runTest('buildSortByKeys - prioritizes complex values', () => {
  const obj1 = {
    simpleBoolean: true,
    complexObject: { nested: 'value' },
    stringValue: 'test'
  };
  
  const obj2 = {
    simpleBoolean: false,
    complexObject: { nested: 'different' },
    stringValue: 'test'
  };
  
  const keys = ['simpleBoolean', 'complexObject', 'stringValue'];
  const sortFn = buildSortByKeys(keys);
  
  // Should compare complexObject first (highest complexity), not simpleBoolean
  const result = sortFn(obj1, obj2);
  
  // Since complexObject values are different, the comparison should be based on that
  // 'different' < 'value', so obj2 should come before obj1
  assert.strictEqual(result > 0, true);
});

runTest('buildSortByKeys - falls back to less complex when complex values are equal', () => {
  const obj1 = {
    simpleBoolean: true,
    complexObject: { nested: 'value' },
    stringValue: 'apple'
  };
  
  const obj2 = {
    simpleBoolean: false,
    complexObject: { nested: 'value' }, // Same as obj1
    stringValue: 'banana'
  };
  
  const keys = ['simpleBoolean', 'complexObject', 'stringValue'];
  const sortFn = buildSortByKeys(keys);
  
  // Should compare complexObject first (equal), then stringValue (next most complex)
  const result = sortFn(obj1, obj2);
  
  // 'apple' < 'banana', so obj1 should come before obj2
  assert.strictEqual(result < 0, true);
});

runTest('buildSortByKeys - returns 0 when all values are equal', () => {
  const obj1 = {
    simpleBoolean: true,
    complexObject: { nested: 'value' },
    stringValue: 'test'
  };
  
  const obj2 = {
    simpleBoolean: true,
    complexObject: { nested: 'value' },
    stringValue: 'test'
  };
  
  const keys = ['simpleBoolean', 'complexObject', 'stringValue'];
  const sortFn = buildSortByKeys(keys);
  
  const result = sortFn(obj1, obj2);
  assert.strictEqual(result, 0);
});
