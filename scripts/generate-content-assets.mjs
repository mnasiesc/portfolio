import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schema = JSON.parse(fs.readFileSync("content/portfolio.schema.json", "utf8"));
const content = JSON.parse(fs.readFileSync("content/portfolio.json", "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(content)) {
  throw new Error(`Cannot generate image assets from invalid content: ${JSON.stringify(validate.errors)}`);
}

const outputDirectory = path.join(process.cwd(), "public", "generated-content");
fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const image of content.images) {
  const filename = path.basename(image.generatedFile);
  fs.writeFileSync(path.join(outputDirectory, filename), Buffer.from(image.data, "base64"));
}

console.log(`Generated ${content.images.length} image assets from content/portfolio.json.`);