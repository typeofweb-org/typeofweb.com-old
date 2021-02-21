import Frontmatter from "front-matter";
import Yaml from "js-yaml";
import * as Fs from "fs";
import * as Path from "path";
const Fsp = Fs.promises;

const fieldsWhichAreArraysButShouldNotBe = [
  "dsq_thread_id",
  "seo_title",
  "seo_metadesc",
  "seo_meta-robots-nofollow", // '1'
  "seo_opengraph-image-id",
  "seo_opengraph-image",
  "seo_twitter-image",
  "seo_focuskeywords", // array in array
  "seo_focuskw_text_input",
  "seo_focuskw",
  "seo_is_cornerstone", // '1'
  "seo_keywordsynonyms", // array in array
] as const;

const pseudoBooleans = [
  "seo_meta-robots-nofollow", // '1'
  "seo_is_cornerstone", // '1'
];

const stringifiedArrays = ["seo_focuskeywords", "seo_keywordsynonyms"];

const seoFields = [
  "seo_focuskeywords",
  "seo_focuskw_text_input",
  "seo_focuskw",
  "seo_is_cornerstone",
  "seo_keywordsynonyms",
  "seo_meta-robots-nofollow",
  "seo_metadesc",
  "seo_opengraph-image-id",
  "seo_opengraph-image",
  "seo_title",
  "seo_twitter-image",
];

async function init() {
  const dir = await Fsp.readdir(Path.join(__dirname, "blog"));
  await Promise.all(
    dir
      .filter(
        (filename) => !filename.startsWith(".") && filename.endsWith(".md")
      )
      .map(async (filename) => {
        const filePath = Path.join(__dirname, "blog", filename);
        const file = await Fsp.readFile(filePath, "utf-8");
        const fm = Frontmatter<Record<string, any>>(file);

        fieldsWhichAreArraysButShouldNotBe.forEach((field) => {
          if (field in fm.attributes) {
            fm.attributes[field] = fm.attributes[field][0];
          }
        });
        pseudoBooleans.forEach((field) => {
          if (field in fm.attributes) {
            fm.attributes[field] = Boolean(
              parseInt(fm.attributes[field].trim(), 10)
            );
          }
        });
        stringifiedArrays.forEach((field) => {
          if (field in fm.attributes) {
            fm.attributes[field] = JSON.parse(fm.attributes[field]);
          }
        });
        Object.keys(fm.attributes).forEach((key) => {
          if (Array.isArray(fm.attributes[key])) {
            fm.attributes[key] = fm.attributes[key].filter(
              (el: unknown) => typeof el !== "string" || el.trim()
            );
          }
        });
        seoFields.forEach((field) => {
          if (field in fm.attributes) {
            fm.attributes.seo = fm.attributes.seo || {};
            const newField = field.replace("seo_", "");
            fm.attributes.seo[newField] = fm.attributes[field];
            delete fm.attributes[field];
          }
        });

        const excerpt = (() => {
          const firstParagraphEndIndex = fm.body.indexOf("\n\n");
          const firstHeaderIndex = fm.body.indexOf("## ") - 2;
          const excerptEndIndex = Math.min(
            firstParagraphEndIndex,
            firstHeaderIndex
          );
          return fm.body.slice(0, excerptEndIndex).trim();
        })();
        fm.attributes.excerpt = excerpt;

        const newFileContent =
          `---
${Yaml.dump(fm.attributes)}
---
${fm.body}`.trim() + "\n";

        Fsp.writeFile(filePath, newFileContent, "utf-8");
      })
  );
}

init();
