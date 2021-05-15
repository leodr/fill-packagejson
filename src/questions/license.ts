import { prompt } from "enquirer";
import { JsonObject } from "type-fest";
import { licenses } from "../licenses";

export async function getLicense(
  packageJson: JsonObject
): Promise<string | object> {
  if (
    (typeof packageJson.license === "string" ||
      typeof packageJson.license === "object") &&
    packageJson.license !== null
  ) {
    return packageJson.license;
  }

  const { licenseName }: { licenseName: string } = await prompt({
    type: "select",
    name: "licenseName",
    message: "What license do you want to use?",
    choices: licenses.map((license) => ({
      name: license.name,
      value: license.id,
    })),
  });

  const license = licenses.find((l) => l.name === licenseName)?.id!;

  return license;
}
