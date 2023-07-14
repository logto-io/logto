import { fileNameUrlEncoder } from './utils.js';

describe('fileNameUrlEncoder', () => {
  it('should return the same URL if the URL does not contain a filename', () => {
    const url = 'https://logto.dev/users/vip';
    expect(fileNameUrlEncoder(url)).toEqual(url);
  });

  it('should return the same URL if the URL does contain a filename without characters which need to be encoded', () => {
    const url = 'https://logto.dev/users/avatar.png';
    expect(fileNameUrlEncoder(url)).toEqual(url);
  });

  it('should return the same url if the url does not contain a filename', () => {
    const url = 'https://logto.dev/users/handsome boy.png';
    expect(fileNameUrlEncoder(url)).toEqual('https://logto.dev/users/handsome%20boy.png');
  });
});
