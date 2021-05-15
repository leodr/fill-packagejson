import chalk from "chalk";
import { prompt } from "enquirer";
import equal from "fast-deep-equal";
import * as fs from "fs";
import ora from "ora";
import * as path from "path";
import sortPackageJson from "sort-package-json";
import type { JsonObject } from "type-fest";
import { promisify } from "util";
import { getLicenseText } from "./license-text";
import { licenses } from "./licenses";
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
  const pkgJsonLocation = path.join(process.cwd(), "package.json");

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

  const { bugs, homepage, repository } = await getRepositoryInfo(packageJson, {
    name,
  });

  const license = await getLicense(packageJson);

  const author = await getAuthor(packageJson);

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
      pkgJsonLocation,
      `${JSON.stringify(sortedPkg, null, 2)}\n`
    );

    spinner.succeed("Saved your completed `package.json` file!");
  }

  const filesInCwd = fs.readdirSync(process.cwd());

  const hasLicenseFile = filesInCwd.some((filename) =>
    /^(license|license\.md)$/i.test(filename)
  );

  if (
    !hasLicenseFile &&
    typeof license === "string" &&
    licenses
      .map((license) => license.id.toLowerCase())
      .includes(license.toLowerCase()) &&
    typeof author === "string"
  ) {
    const { wantsLicense }: { wantsLicense: boolean } = await prompt({
      type: "confirm",
      name: "wantsLicense",
      message: "Do you want to add a license file?",
    });

    if (wantsLicense) {
      await writeFileAsync(
        path.resolve("LICENSE"),
        getLicenseText(license, author.split(" <")[0]!)
      );
    }
  }

  if (!("main" in pkg) && !("bin" in pkg)) {
    console.log(
      chalk.blueBright(
        "\nDon't forget to add a `main` or `bin` entry to your `package.json` to make it usable for consumers."
      )
    );
  }
}

start().catch((e: Error) => {
  console.error(chalk.redBright(e.message));
  process.exit(1);
});
