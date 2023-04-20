import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { TextDecoder, TextEncoder } from 'text-encoder';

const { jest } = import.meta;

dotenv.config();

/* eslint-disable @silverhand/fp/no-mutation */
global.fetch = fetch;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
/* eslint-enable @silverhand/fp/no-mutation */

jest.setTimeout(15_000);
