import { prompt } from "enquirer";
import { JsonObject } from "type-fest";

interface AuthorData {
  name: string;
  email: string;
  website: string;
}

export async function getAuthor(
  packageJson: JsonObject
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
        name: "email",
        message: "Public email",
      },
      {
        name: "website",
        message: "Website",
      },
    ],
  });

  let authorString = authorData.name;

  if (authorData.email) {
    authorString += ` <${authorData.email}>`;
  }

  if (authorData.website) {
    authorString += ` (${authorData.website})`;
  }

  return authorString;
}
