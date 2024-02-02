import https from "https";
import http from "http";
import fs from "fs";
import { Express } from "express";

export function createServer(app: Express) {
  if (process.env.NODE_ENV === "production") {
    const { cert, ca, key } = getSSLCert();
    return https.createServer({ cert, ca, key }, app);
  }

  return http.createServer(app);
}

function getSSLCert() {
  const cert = fs.readFileSync("./ssl/gshub_pro.crt", "utf8");
  const key = fs.readFileSync("./ssl/gshub_pro.key", "utf8");
  const ca = fs
    .readFileSync("./ssl/gshub_pro.ca-bundle", "utf8")
    .split("-----END CERTIFICATE-----\r\n")
    .map((c) => c + "-----END CERTIFICATE-----\r\n");
  ca.pop();

  return { cert, key, ca };
}
