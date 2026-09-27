import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const homeView = extractFunction("HomeView");
const rankingView = extractFunction("RankingView");
const navItems = source.match(/const navItems = \[([\s\S]*?)\n\];/)?.[1] ?? "";
const routes = source.match(/<Routes>([\s\S]*?)<\/Routes>/)?.[1] ?? "";

function extractFunction(name: string) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) return "";
  const next = source.indexOf("\nfunction ", start + 1);
  return source.slice(start, next < 0 ? undefined : next);
}

describe("Home and Ranking layout", () => {
  it("keeps the Home stats cards but removes the leaderboard table", () => {
    expect(homeView).toContain('className="stat-grid"');
    expect(homeView).not.toContain("<LeaderboardSection");
    expect(homeView).not.toContain("trpc.leaderboard.top.useQuery()");
  });

  it("places Ranking after recipes in the navigation", () => {
    const recipesIndex = navItems.indexOf('label: "สูตรยา"');
    const rankingIndex = navItems.indexOf('label: "Ranking"');
    const howToIndex = navItems.indexOf('label: "วิธีการเล่น"');

    expect(recipesIndex).toBeGreaterThanOrEqual(0);
    expect(rankingIndex).toBeGreaterThan(recipesIndex);
    expect(howToIndex).toBeGreaterThan(rankingIndex);
    expect(navItems).toContain('to: "/ranking"');
  });

  it("shows all difficulty tables on Ranking and offers a close action", () => {
    expect(routes).toContain('<Route path="/ranking" element={<RankingView />} />');
    expect(rankingView).toContain("trpc.leaderboard.top.useQuery()");
    expect(rankingView).toContain("<LeaderboardSection");
    expect(rankingView).toContain('aria-label="ปิดตารางสถิติ"');
    expect(rankingView).toContain('navigate("/")');
  });
});
