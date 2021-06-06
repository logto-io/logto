import Koa from 'koa';

const app = new Koa();

app.use((ctx) => {
  ctx.body = 'Hello, world!';
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
