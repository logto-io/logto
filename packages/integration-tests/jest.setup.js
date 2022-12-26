// Need to disable following rules to mock text-decode/text-encoder and crypto for jsdom
// https://github.com/jsdom/jsdom/issues/1612
import { Crypto } from '@peculiar/webcrypto';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { TextDecoder, TextEncoder } from 'text-encoder';

const { jest } = import.meta;

dotenv.config();

/* eslint-disable @silverhand/fp/no-mutation */
global.crypto = new Crypto();
global.fetch = fetch;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
/* eslint-enable @silverhand/fp/no-mutation */

jest.setTimeout(15_000);
