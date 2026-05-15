import { createApp } from "./app";
import { env } from "./config/env";
import { closeDb } from "./db";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`[api] HALO API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`[api] ${signal} received. Closing server...`);
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
