import { prompt } from "enquirer";
import { JsonObject } from "type-fest";

interface AuthorData {
    name: string;
    website: string;
}

interface GetAuthorOptions {
    username: string;
}

export async function getAuthor(
    packageJson: JsonObject,
    { username }: GetAuthorOptions
): Promise<string | object> {
    if (
        (typeof packageJson.author === "string" ||
            typeof packageJson.author === "object") &&
        packageJson.author !== null
    ) {
        return packageJson.author;
    }

    // @ts-expect-error
    const { authorData }: { authorData: AuthorData } = await prompt({
        type: "form",
        name: "authorData",
        message: "What author information should be shown?",
        choices: [
            { name: "name", message: "Name", initial: "John Doe" },
            {
                name: "website",
                message: "Website",
                initial: `https://github.com/${username}/`,
            },
        ],
    });

    return `${authorData.name} (${authorData.website})`;
}
