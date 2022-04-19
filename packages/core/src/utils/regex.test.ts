import { hexColorRegEx } from '@/utils/regex';

const invalidColors = [
  '',
  '#',
  '#1',
  '#2B',
  '#3cZ',
  '#4D9e',
  '#5f80E',
  '#6GHiXY',
  '#78Cb5dA',
  'rgb(0,13,255)',
];

const validColors = ['#aB3', '#169deF'];

describe('hexColorRegEx', () => {
  test.each(validColors)('%p should succeed', async (validColor) => {
    expect(hexColorRegEx.test(validColor)).toBeTruthy();
  });
  test.each(invalidColors)('%p should fail', async (invalidColor) => {
    expect(hexColorRegEx.test(invalidColor)).toBeFalsy();
  });
});
