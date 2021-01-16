import { prompt } from "enquirer";
import semver from "semver";

export async function getVersion() {
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

    return version;
}
