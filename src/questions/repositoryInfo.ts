import { prompt } from "enquirer";
import { JsonObject, JsonValue } from "type-fest";
import { isWebUri } from "valid-url";

type Repository = JsonValue | string;

interface RepositoryInfo {
  repository?: Repository;
  homepage?: string;
  bugs?: string | object;
}

interface GetRepositoryInfoOptions {
  name: string;
}

export async function getRepositoryInfo(
  packageJson: JsonObject,
  { name }: GetRepositoryInfoOptions
): Promise<RepositoryInfo> {
  const { repo }: { repo: string } = await prompt({
    type: "input",
    name: "repo",
    message: "Is this project associated with a GitHub repository?",
    initial: `project-owner/${name}`,
    format: (value) => value.toLowerCase().replace(/[a-z0-9.\-_/]/, ""),
    validate(value) {
      if (value === "") return true;

      if (/^[a-z0-9\-._]*\/[a-z0-9\-._]*$/.test(value)) return true;

      return "This should follow the format `project-owner/project-name`.";
    },
  });

  const repository = repo ? `github:${repo}` : undefined;

  let homepage: string | undefined;

  if (typeof packageJson.homepage === "string") {
    homepage = packageJson.homepage;
  } else {
    const { homepageUrl }: { homepageUrl: string } = await prompt({
      type: "input",
      name: "homepageUrl",
      message: "Does this project have a dedicated website?",
      initial: repo ? `https://github.com/${repo}#readme` : "",
      validate(value) {
        if (isWebUri(value)) return true;
        return "This is not a valid URL.";
      },
    });

    if (homepageUrl !== `https://github.com/${repo}#readme`) {
      homepage = homepageUrl;
    }
  }

  let bugs: string | object | undefined;

  if (
    (typeof packageJson.bugs === "string" ||
      typeof packageJson.bugs === "object") &&
    packageJson.bugs !== null
  ) {
    bugs = packageJson.bugs;
  }

  return {
    repository: repository ?? packageJson.repository,
    homepage,
    bugs,
  };
}
