import { Readable } from 'node:stream';

import { streamToString } from './file.js';

describe('streamToString()', () => {
  it('should return an empty string if the stream is empty', async () => {
    const result = await streamToString();
    expect(result).toBe('');
  });

  it('should return the stream content as a string', async () => {
    const stream = Readable.from(['Hello', ' ', 'world', '!']);
    const result = await streamToString(stream);
    expect(result).toBe('Hello world!');
  });
});
