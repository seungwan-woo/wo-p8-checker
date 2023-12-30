import { describe, expect, test } from "@jest/globals";
import {
  fetchMemoryUsageDocument,
  hasMemoryBudget,
  getMemoryUsageContent,
} from "./memoryUsageUtil";

describe("memoryUsageUtil", () => {
  let memoryUsageDoc: Document | undefined;
  let memoryUsage: string | undefined;

  beforeAll(async () => {
    memoryUsageDoc = await fetchMemoryUsageDocument();
  });

  test("should get memory-usage document, when fetchMemoryUsageDocument()", async () => {
    expect(memoryUsageDoc).not.toBeUndefined();
    expect(memoryUsageDoc?.body.textContent).toMatchSnapshot();
  });

  test("should get memory usage content, when getMemoryUsageContent(memoryUsageDoc)", async () => {
    expect(memoryUsageDoc).not.toBeUndefined();

    memoryUsage = getMemoryUsageContent(memoryUsageDoc!);
    expect(memoryUsage).not.toBeUndefined();
    expect(memoryUsage).toMatchSnapshot();
  });

  test("should be truthy, when hasMemoryBudget(Normal)", () => {
    const normalMemoryBudget = hasMemoryBudget(memoryUsage!, "Normal");
    expect(normalMemoryBudget).toBeTruthy();
  });

  test("should be truthy, when hasMemoryBudget(Ambient)", () => {
    const ambientMemoryBudget = hasMemoryBudget(memoryUsage!, "Ambient");
    expect(ambientMemoryBudget).toBeTruthy();
  });
});
