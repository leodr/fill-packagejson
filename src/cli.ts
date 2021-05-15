import chalk from "chalk";
import equal from "fast-deep-equal";
import * as fs from "fs";
import ora from "ora";
import * as path from "path";
import sortPackageJson from "sort-package-json";
import type { JsonObject } from "type-fest";
import { promisify } from "util";
import { getAuthor } from "./questions/author";
import { getDescription } from "./questions/description";
import { getKeywords } from "./questions/keywords";
import { getLicense } from "./questions/license";
import { getName } from "./questions/name";
import { getRepositoryInfo } from "./questions/repositoryInfo";
import { getVersion } from "./questions/version";

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function start() {
  const pkgJsonLocation = path.resolve("package-gen.json");

  let packageJson: JsonObject;

  if (fs.existsSync(pkgJsonLocation)) {
    let pkgJsonString: string;

    try {
      pkgJsonString = await readFileAsync(pkgJsonLocation, {
        encoding: "utf-8",
      });
    } catch {
      throw Error("Failed to read your `package.json` file.");
    }

    try {
      const json = JSON.parse(pkgJsonString);

      if (typeof json !== "object") {
        throw Error("`package.json` does not contain a JSON object.");
      }

      packageJson = json;
      console.log(
        chalk.blueBright(
          "Loaded your package.json file. You will now be asked to fill in missing fields."
        )
      );
    } catch {
      throw Error("`package.json` does not contain a valid JSON object.");
    }
  } else {
    packageJson = {};

    chalk.blueBright(
      "No package.json found in this directory, we will now create one based on your answers."
    );
  }

  const name = await getName(packageJson);

  const version = await getVersion(packageJson);

  const description = await getDescription(packageJson);

  const keywords = await getKeywords(packageJson);

  const { bugs, homepage, repository, username } = await getRepositoryInfo(
    packageJson,
    { name }
  );

  const license = await getLicense(packageJson);

  const author = await getAuthor(packageJson, { username });

  const pkg: JsonObject = {
    ...packageJson,
    name,
    version,
    description,
    keywords,
    repository,
    homepage,
    bugs,
    license,
    author,
  };

  if (equal(packageJson, pkg)) {
    ora().succeed("Your `package.json` file is already complete!");
  } else {
    const sortedPkg = sortPackageJson(pkg);

    const spinner = ora("Saving `package.json`...").start();

    await writeFileAsync(
      path.resolve("package-gen.json"),
      JSON.stringify(sortedPkg, null, 4)
    );

    spinner.succeed("Saved your completed `package.json` file!");
  }

  // TODO: Hint if no main or bin
}

start().catch((e: Error) => {
  console.error(chalk.redBright(e.message));
  process.exit(1);
});
