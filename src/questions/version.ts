import { prompt } from "enquirer";
import semver from "semver";
import { JsonObject } from "type-fest";

export async function getVersion(packageJson: JsonObject): Promise<string> {
    if (
        packageJson.version &&
        typeof packageJson.version === "string" &&
        semver.valid(packageJson.version)
    ) {
        return packageJson.version;
    }

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
