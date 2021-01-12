import * as chalk from "chalk";
import { prompt } from "enquirer";
import * as fs from "fs";
import * as path from "path";
import type { JsonValue } from "type-fest";
import { promisify } from "util";

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

    const { name }: { name: string } = await prompt({
        type: "input",
        name: "name",
        message: "What should the package name be?",
        initial: path.basename(process.cwd()),
    });

    const { version }: { version: string } = await prompt({
        type: "input",
        name: "version",
        message: "What should the initial version be?",
        initial: "0.1.0",
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
    });

    const { homepage }: { homepage: string } = await prompt({
        type: "input",
        name: "homepage",
        message: "What ",
    });
}

start().catch((e: Error) => {
    console.error(chalk.redBright(e.message));
    process.exit(1);
});
