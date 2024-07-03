import { build } from "./app.js";

const app = await build();

app.listen({ host: "0.0.0.0", port: 4005 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`MyGovId Mock Service listening at ${address}`);
});

await app.ready();
