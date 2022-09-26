import { getTimestampFromFileName } from './utils';

describe('getTimestampFromFileName()', () => {
  it('should get for 1.0.0-1663923211.js', () => {
    expect(getTimestampFromFileName('1.0.0-1663923211.js')).toEqual(1_663_923_211);
  });

  it('should get for 1.0.0-1663923211-user-table.js', () => {
    expect(getTimestampFromFileName('1.0.0-1663923211-user-table.js')).toEqual(1_663_923_211);
  });

  it('should throw for 166392321.js', () => {
    expect(() => getTimestampFromFileName('166392321.js')).toThrowError();
  });
});
