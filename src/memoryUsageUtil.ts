import axios, { AxiosResponse } from "axios";
import { tryCatch, TaskEither, map, chain } from "fp-ts/TaskEither";
import { isLeft, toError } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

const WEAR_APP_QUALITY_URL: Readonly<string> =
  "https://developer.android.com/docs/quality-guidelines/wear-app-quality#performance-functionality";

const MEMORY_USAGE_REGEX: Readonly<RegExp> =
  /<tr id="memory-usage">[\s\S]*?<\/tr>/;

function safeGet(url: string): TaskEither<Error, AxiosResponse> {
  return tryCatch(() => axios.get(url), toError);
}

function findMemoryUsage(data: string): TaskEither<Error, string> {
  return tryCatch(async () => {
    const result = data.match(MEMORY_USAGE_REGEX)?.[0];
    if (!result) throw Error("failed to find memory-usage");
    return result;
  }, toError);
}

function getMemoryUsageDoc(memoryUsage: string): TaskEither<Error, Document> {
  return tryCatch(async () => {
    return new DOMParser().parseFromString(memoryUsage, "text/html");
  }, toError);
}

export async function fetchMemoryUsageDocument() {
  const memoryUsageDocTask = pipe(
    safeGet(WEAR_APP_QUALITY_URL),
    map((resp: AxiosResponse<string>) => resp.data),
    chain(findMemoryUsage),
    chain(getMemoryUsageDoc)
  );

  const memoryUsageDoc = await memoryUsageDocTask();
  if (isLeft(memoryUsageDoc)) return undefined;
  return memoryUsageDoc.right;
}

export function getMemoryUsageContent(
  memoryUsageDoc: Document
): string | undefined {
  const result = memoryUsageDoc
    .querySelector("p")
    ?.textContent?.replace(/\u00a0/g, " ")
    .trim();
  return result;
}
