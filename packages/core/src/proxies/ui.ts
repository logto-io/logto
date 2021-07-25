import proxy from 'koa-proxies';

// CAUTION: this is for testing only
export default function uiProxy() {
  return proxy(/^\/(?!api|oidc).*$/, {
    target: 'http://localhost:5000',
    changeOrigin: true,
    logs: true,
  });
}
