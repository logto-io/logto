import { getEnv } from '@silverhand/essentials';
import got from 'got';

export default got.extend({ prefixUrl: new URL('/api', getEnv('LOGTO_URL')) });
