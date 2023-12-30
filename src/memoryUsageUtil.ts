import axios, { AxiosResponse } from "axios";
import { tryCatch, TaskEither, map, chain } from "fp-ts/TaskEither";
import { isLeft, toError } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

type MemoryBudgetType = "Normal" | "Ambient";
type MemoryBudgetRegexType = { [key in MemoryBudgetType]: RegExp };

const WEAR_APP_QUALITY_URL: Readonly<string> =
  "https://developer.android.com/docs/quality-guidelines/wear-app-quality#performance-functionality";

const MEMORY_USAGE_REGEX: Readonly<RegExp> =
  /<tr id="memory-usage">[\s\S]*?<\/tr>/;

const MEMORY_USAGE_REGEXS: MemoryBudgetRegexType = {
  Normal: /100.MB/,
  Ambient: /10.MB/,
};

export function hasMemoryBudget(
  memoryUsageContent: string,
  type: MemoryBudgetType
) {
  return MEMORY_USAGE_REGEXS[type].test(memoryUsageContent);
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
