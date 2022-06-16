// Need to disable following rules to mock text-decode/text-encoder and crypto for jsdom
// https://github.com/jsdom/jsdom/issues/1612
import { Crypto } from '@peculiar/webcrypto';
import { TextDecoder, TextEncoder } from 'text-encoder';

// eslint-disable-next-line unicorn/prefer-module
const fetch = require('node-fetch');

/* eslint-disable @silverhand/fp/no-mutation */
global.crypto = new Crypto();
global.fetch = fetch;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
/* eslint-enable @silverhand/fp/no-mutation */
