import { prompt } from "enquirer";
import { isWebUri } from "valid-url";

interface RepositoryInfo {
    repository: { type: string; url: string };
    homepage: string;
    bugs: string;
    username: string;
}

interface GetRepositoryInfoOptions {
    name: string;
}

export async function getRepositoryInfo({
    name,
}: GetRepositoryInfoOptions): Promise<RepositoryInfo> {
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

    return {
        repository,
        homepage,
        bugs,
        username: repo.split("/")[0] ?? "",
    };
}
