import { prompt } from "enquirer";

export async function getDescription() {
    const { description }: { description: string } = await prompt({
        type: "input",
        name: "description",
        message: "How would you describe the package in one sentence?",
    });

    return description;
}
