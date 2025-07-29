import { allDataHandler, dataHandler, imageHandler } from "./data";
import { HEADERS } from "./headers";

const server = Bun.serve({
  port: 8000,
  routes: {
    "/assets/*": async (req) => {
      const blob = Bun.file(
        `${import.meta.dirname}/../public${new URL(req.url).pathname}`,
      );
      return new Response(blob, { headers: HEADERS });
    },
    "/api/v3/data": allDataHandler,
    "/api/v3/data/:id": dataHandler,
    "/api/v3/images/:id": imageHandler,
    "/*": () => new Response("Not Found", { status: 404 }),
  },
});
console.log(`Server running at http://localhost:${server.port}/`);