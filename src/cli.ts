import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import sortPackageJson from "sort-package-json";
import type { JsonValue, PackageJson } from "type-fest";
import { promisify } from "util";
import { getAuthor } from "./questions/author";
import { getDescription } from "./questions/description";
import { getKeywords } from "./questions/keywords";
import { getLicense } from "./questions/license";
import { getName } from "./questions/name";
import { getRepositoryInfo } from "./questions/repositoryInfo";
import { getVersion } from "./questions/version";

const readFileAsync = promisify(fs.readFile);

async function start() {
    const pkgJsonLocation = path.resolve("package.json");

    let pkgJsonString: string;

    try {
        pkgJsonString = await readFileAsync(pkgJsonLocation, {
            encoding: "utf-8",
        });
    } catch {
        throw Error(
            "Could not read `package.json` file. Are you in the right directory?"
        );
    }

    let packageJson: JsonValue;

    try {
        packageJson = JSON.parse(pkgJsonString);
    } catch {}

    const name = await getName();

    const version = await getVersion();

    const description = await getDescription();

    const keywords = await getKeywords();

    const { bugs, homepage, repository, username } = await getRepositoryInfo({
        name,
    });

    const license = await getLicense();

    const author = await getAuthor({ username });

    const pkg: PackageJson = {
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

    const sortedPkg = sortPackageJson(pkg);

    fs.writeFileSync(
        path.resolve("package-gen.json"),
        JSON.stringify(sortedPkg, null, 2)
    );

    // Hint if no main or bin
}

start().catch((e: Error) => {
    console.error(chalk.redBright(e.message));
    process.exit(1);
});
