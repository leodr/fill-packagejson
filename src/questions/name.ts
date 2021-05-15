import { prompt } from "enquirer";
import * as path from "path";
import { JsonObject } from "type-fest";
import validatePackageName from "validate-npm-package-name";

export async function getName(packageJson: JsonObject): Promise<string> {
  if (
    typeof packageJson.name === "string" &&
    validatePackageName(packageJson.name).validForNewPackages
  ) {
    return packageJson.name;
  }

  const { name }: { name: string } = await prompt({
    type: "input",
    name: "name",
    message: "What should the package name be?",
    initial: path.basename(process.cwd()),
    validate(value) {
      const result = validatePackageName(value);

      if (result.validForNewPackages) return true;

      if (result.errors?.length) {
        return result.errors.join(", ");
      }
      return false;
    },
    format(value) {
      return value.toLowerCase();
    },
  });

  return name;
}
