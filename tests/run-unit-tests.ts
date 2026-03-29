import assert from "assert";
import { validateCreateJobInput, validateUpdateJobInput } from "../src/lib/job-input";
import { parseJobsPage, parseJobsSortOrder } from "../src/lib/jobs-list";
import { toE164AmPhone } from "../src/lib/phone";
import { parseCommaListParam } from "../src/lib/query-filters";

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest("parseCommaListParam trims values and removes empty entries", () => {
  assert.deepEqual(parseCommaListParam("  dev , , design,  qa  "), ["dev", "design", "qa"]);
});

runTest("parseCommaListParam returns empty array for missing value", () => {
  assert.deepEqual(parseCommaListParam(undefined), []);
});

runTest("toE164AmPhone keeps full Armenian E.164-compatible digits", () => {
  assert.equal(toE164AmPhone("+374 99 123 456"), "+37499123456");
});

runTest("toE164AmPhone adds Armenian country code for local 8-digit input", () => {
  assert.equal(toE164AmPhone("99 123 456"), "+37499123456");
});

runTest("toE164AmPhone rejects invalid phone lengths", () => {
  assert.equal(toE164AmPhone("12345"), null);
});

runTest("parseJobsPage falls back to page 1 for invalid values", () => {
  assert.equal(parseJobsPage(undefined), 1);
  assert.equal(parseJobsPage("0"), 1);
  assert.equal(parseJobsPage("-3"), 1);
  assert.equal(parseJobsPage("abc"), 1);
});

runTest("parseJobsPage parses positive page numbers", () => {
  assert.equal(parseJobsPage("7"), 7);
});

runTest("parseJobsSortOrder returns asc only for old sort", () => {
  assert.equal(parseJobsSortOrder("old"), "asc");
  assert.equal(parseJobsSortOrder("new"), "desc");
  assert.equal(parseJobsSortOrder(undefined), "desc");
});

runTest("validateCreateJobInput normalizes and validates payload", () => {
  const result = validateCreateJobInput({
    title: "  Need loaders tonight  ",
    description: "  Carry boxes to the 3rd floor  ",
    category: "loaders",
    price: " 15000 AMD ",
    region: "yerevan",
    address: "  Arabkir, Komitas 12  ",
    isUrgent: true,
    date: "2026-03-29",
    time: "18:30",
    contactPhone: "+374 99 123 456",
    contactMethod: "telegram",
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.deepEqual(result.data, {
    title: "Need loaders tonight",
    description: "Carry boxes to the 3rd floor",
    category: "loaders",
    price: "15000 AMD",
    priceType: "fixed",
    region: "yerevan",
    address: "Arabkir, Komitas 12",
    isUrgent: true,
    date: "2026-03-29",
    time: "18:30",
    contactPhone: "+37499123456",
    contactMethod: "telegram",
  });
});

runTest("validateCreateJobInput rejects invalid category", () => {
  const result = validateCreateJobInput({
    title: "Need help",
    category: "invalid-category",
    region: "yerevan",
    address: "Arabkir 1",
    contactPhone: "99 123 456",
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, "Invalid category");
  }
});

runTest("validateUpdateJobInput allows partial updates and normalizes phone", () => {
  const result = validateUpdateJobInput({
    title: "  Updated title  ",
    contactPhone: "99 123 456",
    status: "closed",
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.deepEqual(result.data, {
    title: "Updated title",
    contactPhone: "+37499123456",
    status: "closed",
  });
});

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}
