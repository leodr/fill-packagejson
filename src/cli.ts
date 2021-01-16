import chalk from "chalk";
import { prompt } from "enquirer";
import * as fs from "fs";
import * as path from "path";
import * as semver from "semver";
import sortPackageJson from "sort-package-json";
import type { JsonValue, PackageJson } from "type-fest";
import { promisify } from "util";
import { isWebUri } from "valid-url";
import validatePackageName from "validate-npm-package-name";

const readFileAsync = promisify(fs.readFile);

const licenses = [
    { id: "MIT", name: "MIT License (recommended)" },
    { id: "Apache-2.0", name: "Apache License 2.0" },
    { id: "GPL-3.0-only", name: "GNU General Public License v3.0" },
    { id: "BSD-2-Clause", name: 'BSD 2-Clause "Simplified" License' },
    { id: "BSD-3-Clause", name: 'BSD 3-Clause "New" or "Revised" License' },
];

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

    const { version }: { version: string } = await prompt({
        type: "input",
        name: "version",
        message: "What should the initial version be?",
        initial: "0.1.0",
        validate(value) {
            if (semver.valid(value)) return true;

            return "Invalid semver version.";
        },
    });

    const { description }: { description: string } = await prompt({
        type: "input",
        name: "description",
        message: "How would you describe the package in one sentence?",
    });

    const { keywords }: { keywords: string[] } = await prompt({
        type: "list",
        name: "keywords",
        message:
            "What categories does your package belong to? (comma-separated)",
        // @ts-expect-error
        format(value) {
            if (Array.isArray(value)) return value.map((s) => s.toLowerCase());
            return value;
        },
    });

    const { repo }: { repo: string } = await prompt({
        type: "input",
        name: "repo",
        message: "Is this project associated with a GitHub repository?",
        initial: `project-owner/${name}`,
        format: (value) => value.toLowerCase().replace(/[a-z0-9\.\-\_\/]/, ""),
        validate(value) {
            if (/^[a-z0-9\-\._]*\/[a-z0-9\-\._]*$/.test(value)) return true;

            return "This should follow the format `project-owner/project-name`.";
        },
    });

    const repository = {
        type: "git",
        url: `https://github.com/${repo}.git`,
    };

    const { homepage }: { homepage: string } = await prompt({
        type: "input",
        name: "homepage",
        message: "Does this project have a dedicated website?",
        initial: `https://github.com/${repo}#readme`,
        validate(value) {
            if (isWebUri(value)) return true;
            return "This is not a valid URL.";
        },
    });

    const bugs = `https://github.com/${repo}/issues`;

    const { licenseName }: { licenseName: string } = await prompt({
        type: "select",
        name: "licenseName",
        message: "What license do you want to use?",
        choices: licenses.map((license) => ({
            name: license.name,
            value: license.id,
        })),
    });

    const license = licenses.find((l) => l.name === licenseName)?.id;

    const {
        authorData,
    }: // @ts-expect-error
    { authorData: { name: string; website: string } } = await prompt({
        type: "form",
        name: "authorData",
        message: "What author information should be shown?",
        choices: [
            { name: "name", message: "Name", initial: "John Doe" },
            {
                name: "website",
                message: "Website",
                initial: `https://github.com/${repo.split("/")[0]}/`,
            },
        ],
    });

    const author = `${authorData.name} (${authorData.website})`;

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
