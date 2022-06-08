`Const` **createLogto**: `LogtoVuePlugin`

Creates the Logto Vue plugin

```ts
import { createApp } from 'vue';
import { createLogto } from '@logto/vue';

const app = createApp(App);
const app.use(createLogto, {
  appId: '<your-app-id>',
  endpoint: '<your-oidc-endpoint-domain>',
});

app.mount('#app');
```

Use this in your Vue root component to register the plugin

#### Defined in

[packages/vue/src/index.ts:51](https://github.com/logto-io/js/blob/5254dee/packages/vue/src/index.ts#L51)
