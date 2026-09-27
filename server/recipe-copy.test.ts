import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const cssSource = readFileSync(resolve(process.cwd(), "client/src/App.css"), "utf8");
const descriptionRule = cssSource.match(
  /\.recipe-header\s+\.recipe-description,\s*\.recipe-header\s+\.howto-description\s*\{([^}]+)\}/,
)?.[1] ?? "";

describe("Recipe-related page description contrast", () => {
  it("applies the higher-specificity dark semibold style to both descriptions", () => {
    expect(appSource).toContain('<p className="recipe-description">');
    expect(appSource).toContain('<p className="howto-description">');
    expect(descriptionRule).toContain("color: #59445d;");
    expect(descriptionRule).toContain("font-weight: 600;");
  });
});
