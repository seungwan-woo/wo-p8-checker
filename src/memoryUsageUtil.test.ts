import { describe, expect, test } from "@jest/globals";
import {
  fetchMemoryUsageDocument,
  getMemoryUsageContent,
} from "./memoryUsageUtil";

describe("memoryUsageUtil", () => {
  test("should include 10MB/100MB, when fetchMemoryUsageDocument() and getMemoryUsageContent()", async () => {
    const memoryUsageDoc: Document | undefined =
      await fetchMemoryUsageDocument();
    expect(memoryUsageDoc).not.toBeUndefined();
    expect(memoryUsageDoc).toMatchSnapshot();

    const memoryUsage = getMemoryUsageContent(memoryUsageDoc!);
    expect(memoryUsage).not.toBeUndefined();
    expect(memoryUsage).toMatchSnapshot();
    expect(memoryUsage?.includes("100 MB")).toBeTruthy();
    expect(memoryUsage?.includes("10 MB")).toBeTruthy();
  });
});
