import { buildIdGenerator } from './id.js';

describe('id generator', () => {
  it('should match the input length', () => {
    const id = buildIdGenerator(10)();
    expect(id.length).toEqual(10);
  });

  it('to random id should not equal', () => {
    const id_1 = buildIdGenerator(10)();
    const id_2 = buildIdGenerator(10)();

    expect(id_1).not.toEqual(id_2);
  });
});
