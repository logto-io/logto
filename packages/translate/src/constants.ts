import os from 'node:os';
import path from 'node:path';

export const defaultPath = path.join(os.homedir(), 'logto');
export const coreDirectory = 'packages/core';
