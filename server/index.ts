import app from "./app";

Bun.serve({
  fetch(req, server) {
    return app.fetch(req, { ip: server.requestIP(req) });
  },
});

console.log("server running");
