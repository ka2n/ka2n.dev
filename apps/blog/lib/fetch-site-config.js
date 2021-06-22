const fs = require("fs/promises");
const path = require("path");
/** @type import('axios').AxiosStatic */
const axios = require("axios");

const env = require("@next/env");

const main = async () => {
  const { MICROCMS_ENDPOINT: baseURL, MICROCMS_KEY: apiKey } =
    env.loadEnvConfig("./", process.env.NODE_ENV !== "production").combinedEnv;

  if (!baseURL || !apiKey)
    throw new Error("MICROCMS_ENDPOINT, MICROCMS_KEY is required");

  const siteResp = await axios.get("/config", {
    baseURL: process.env.MICROCMS_ENDPOINT,
    headers: {
      "X-API-KEY": apiKey,
    },
    transformResponse: [],
  });
  await fs.writeFile(
    path.join(__dirname, "../data/site-config.json"),
    siteResp.data,
    "utf8"
  );
  return 0;
};

const handleUnexpected = async (err) => {
  console.error(`An unexpected error occurred!\n${err.stack}`);
  process.exit(1);
};

process.on("unhandledRejection", handleUnexpected);
process.on("uncaughtException", handleUnexpected);

main()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch(handleUnexpected);
