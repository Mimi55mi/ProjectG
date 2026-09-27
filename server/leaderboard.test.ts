import { describe, expect, it } from "vitest";
import {
  confirmedGameRoute,
  leaderboardSubmissionSchema,
  normalizeLeaderboardName,
  topTenLeaderboardEntries,
} from "../shared/leaderboard";

describe("leaderboard submission validation", () => {
  it("normalizes whitespace in the player name used before play", () => {
    expect(normalizeLeaderboardName("  Moon   Mage  ")).toBe("Moon Mage");
    expect(normalizeLeaderboardName("   ")).toBe("");
  });

  it("does not create a game route until the player has confirmed a non-empty name", () => {
    expect(confirmedGameRoute("hard", "   ")).toBeNull();
    expect(confirmedGameRoute("normal", "  Moon Mage  ")).toBe("/brew?level=normal");
  });

  it("trims player names and accepts valid scores", () => {
    const result = leaderboardSubmissionSchema.parse({
      difficulty: "normal",
      playerName: "  Moon Mage  ",
      score: 620,
      stages: 4,
      correctCount: 3,
    });

    expect(result.playerName).toBe("Moon Mage");
    expect(result.score).toBe(620);
  });

  it("rejects blank names, unsupported levels, and out-of-range values", () => {
    const base = {
      difficulty: "easy",
      playerName: "Player",
      score: 100,
      stages: 2,
      correctCount: 1,
    };

    expect(leaderboardSubmissionSchema.safeParse({ ...base, playerName: "  " }).success).toBe(false);
    expect(leaderboardSubmissionSchema.safeParse({ ...base, playerName: "x".repeat(25) }).success).toBe(false);
    expect(leaderboardSubmissionSchema.safeParse({ ...base, difficulty: "expert" }).success).toBe(false);
    expect(leaderboardSubmissionSchema.safeParse({ ...base, score: -1 }).success).toBe(false);
    expect(leaderboardSubmissionSchema.safeParse({ ...base, score: 1_000_001 }).success).toBe(false);
    expect(leaderboardSubmissionSchema.safeParse({ ...base, stages: 7 }).success).toBe(false);
  });
});

describe("topTenLeaderboardEntries", () => {
  it("sorts by score, uses earlier timestamps for ties, and returns at most ten", () => {
    const entries = Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      score: 120 - index * 10,
      createdAt: new Date(Date.UTC(2026, 0, index + 1)),
    }));

    const ranked = topTenLeaderboardEntries(entries);

    expect(ranked).toHaveLength(10);
    expect(ranked.map((entry) => entry.score)).toEqual([120, 110, 100, 90, 80, 70, 60, 50, 40, 30]);
    expect(entries).toHaveLength(12);
  });

  it("breaks equal-score ties by earlier time and then smaller id", () => {
    const ranked = topTenLeaderboardEntries([
      { id: 8, score: 500, createdAt: "2026-02-02T00:00:00.000Z" },
      { id: 4, score: 500, createdAt: "2026-02-01T00:00:00.000Z" },
      { id: 3, score: 500, createdAt: "2026-02-01T00:00:00.000Z" },
    ]);

    expect(ranked.map((entry) => entry.id)).toEqual([3, 4, 8]);
  });
});
