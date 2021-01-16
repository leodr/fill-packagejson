import { prompt } from "enquirer";

interface AuthorData {
    name: string;
    website: string;
}

interface GetAuthorOptions {
    username: string;
}

export async function getAuthor({ username }: GetAuthorOptions) {
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
