import fs from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schema = JSON.parse(fs.readFileSync("content/portfolio.schema.json", "utf8"));
const content = JSON.parse(fs.readFileSync("content/portfolio.json", "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(content)) {
  console.error("Portfolio content does not match content/portfolio.schema.json:");
  for (const error of validate.errors ?? []) {
    console.error(`- ${error.instancePath || "/"}: ${error.message}`);
  }
  process.exit(1);
}

const assertUnique = (values, label) => {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
};

assertUnique(content.projects.map(({ id }) => id), "project ID");
assertUnique(content.articles.map(({ slug }) => slug), "article slug");
assertUnique(content.images.map(({ id }) => id), "image ID");

const imageById = new Map(content.images.map((image) => [image.id, image]));
const references = [
  content.home.avatarImage,
  ...Object.values(content.site.icons),
  ...content.projects.map((project) => project.image).filter(Boolean),
  ...content.projects.map((project) => project.proofOfWork?.imageId).filter(Boolean),
];

for (const imageId of references) {
  if (!imageById.has(imageId)) throw new Error(`Content references missing image: ${imageId}`);
}

for (const image of content.images) {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(image.data) || image.data.length % 4 !== 0) {
    throw new Error(`Image ${image.id} has invalid base64 data`);
  }
  const bytes = Buffer.from(image.data, "base64");
  if (bytes.length === 0 || bytes.toString("base64") !== image.data) {
    throw new Error(`Image ${image.id} could not be decoded consistently`);
  }
}

console.log(`Validated ${content.projects.length} projects, ${content.articles.length} articles, and ${content.images.length} embedded images.`);