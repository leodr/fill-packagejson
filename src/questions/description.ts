import { prompt } from "enquirer";
import { JsonObject } from "type-fest";

export async function getDescription(packageJson: JsonObject): Promise<string> {
    if (typeof packageJson.description === "string")
        return packageJson.description;

    const { description }: { description: string } = await prompt({
        type: "input",
        name: "description",
        message: "How would you describe the package in one sentence?",
    });

    return description;
}
