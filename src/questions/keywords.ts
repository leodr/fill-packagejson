import { prompt } from "enquirer";

export async function getKeywords() {
    const { keywords }: { keywords: string[] } = await prompt({
        type: "list",
        name: "keywords",
        message:
            "What categories does your package belong to? (comma-separated)",
        // @ts-expect-error
        format(value) {
            if (Array.isArray(value)) return value.map((s) => s.toLowerCase());
            return value;
        },
    });

    return keywords;
}
