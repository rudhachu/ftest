const fs = require("fs").promises;
const path = require("path");
const express = require("express");
const config = require("./config");
const { connect, connectSession, patch } = require("./lib");
const { getandRequirePlugins } = require("./lib/database/plugins");
global.__basedir = __dirname;

const parseDir = async directory => {
 try {
  const files = await fs.readdir(directory);
  return Promise.all(files.filter(file => path.extname(file).toLowerCase() === ".js").map(file => require(path.join(directory, file))));
 } catch (error) {
  console.error("Error reading and requiring files:", error);
  throw error;
 }
};

async function initialize() {
 try {
  await connectSession(config.SESSION_ID, "/lib/session");
  console.log("Version:", require("./package.json").version);

  console.log("WhatsApp Bot Initializing...");
  await parseDir(path.join(__dirname, "/lib/database/"));
  console.log("Syncing Database");
  await config.DATABASE.sync();
  await parseDir(path.join(__dirname, "/plugins/"));
  await getandRequirePlugins();
  console.log("External Modules Installed");
  return await connect();
 } catch (error) {
  console.error("Initialization error:", error);
  process.exit(1);
 }
}

async function startServer() {
 const app = express();
 const port = process.env.PORT || 3000;

 app.get("/", (req, res) => {
  res.send("Bot Running");
 });

 app.listen(port, () => {});
}

async function tempDir() {
 const dir = path.join(__dirname, "temp");
 try {
  await fs.access(dir);
 } catch (err) {
  if (err.code === "ENOENT") {
   await fs.mkdir(dir, { recursive: true });
  }
 }
}

async function main() {
 await initialize();
 await startServer();
 await tempDir();
}

main();
