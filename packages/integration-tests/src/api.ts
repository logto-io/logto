import got from 'got';

import { logtoUrl } from '@/constants';

export default got.extend({ prefixUrl: new URL('/api', logtoUrl) });
