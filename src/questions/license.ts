import { prompt } from "enquirer";
import { JsonObject } from "type-fest";

const licenses = [
    { id: "MIT", name: "MIT License (recommended)" },
    { id: "Apache-2.0", name: "Apache License 2.0" },
    { id: "GPL-3.0-only", name: "GNU General Public License v3.0" },
    { id: "BSD-2-Clause", name: 'BSD 2-Clause "Simplified" License' },
    { id: "BSD-3-Clause", name: 'BSD 3-Clause "New" or "Revised" License' },
];

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
