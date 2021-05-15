import { prompt } from "enquirer";
import { JsonObject } from "type-fest";

export async function getKeywords(packageJson: JsonObject) {
  if (packageJson.keywords && Array.isArray(packageJson.keywords))
    return packageJson.keywords;

  const { keywords }: { keywords: string[] } = await prompt({
    type: "list",
    name: "keywords",
    message: "What categories does your package belong to? (comma-separated)",
    // @ts-expect-error
    format(value) {
      if (Array.isArray(value)) return value.map((s) => s.toLowerCase());
      return value;
    },
  });

  return keywords;
}
