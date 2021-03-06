var fs = require("fs");

function write(path, contents) {
  if (fs.existsSync(path)) {
    console.error("Secrets file exists, skipping: " + path);
  } else {
    fs.writeFile(path, contents, (err) => {
      if (err) throw err;
      console.log("Created secrets file at " + path);
    });
  }
}

src_secrets_path = "./src/secrets.js";
src_secrets = `
// Grab these values from the Firebase console or a running app in the co-reality-map domain
export const API_KEY = "API_KEY";
export const APP_ID = "APP_ID";
export const MEASUREMENT_ID = "MEASUREMENT_ID";
export const BUCKET_URL = "BUCKET_URL";
`;
write(src_secrets_path, src_secrets);
