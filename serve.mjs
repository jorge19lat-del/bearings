#!/usr/bin/env node
/** Minimal preview server for /dist. node serve.mjs [port] */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const port = Number(process.argv[2] || process.env.PORT || 4321);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
};

createServer(async (req, res) => {
  try {
    let file = path.join(dist, decodeURIComponent(req.url.split("?")[0]));
    if (!file.startsWith(dist)) throw new Error("outside root");
    const info = await stat(file).catch(() => null);
    if (!info || info.isDirectory()) file = path.join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end("<p style='font:14px/1.5 system-ui;padding:3rem'>Not found.</p>");
  }
}).listen(port, () => console.log(`BEARINGS — http://localhost:${port}`));
