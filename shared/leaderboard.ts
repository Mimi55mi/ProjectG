import { z } from "zod";

export const leaderboardSubmissionSchema = z.object({
  difficulty: z.enum(["easy", "normal", "hard"]),
  playerName: z.string().trim().min(1).max(24),
  score: z.number().int().min(0).max(1_000_000),
  stages: z.number().int().min(0).max(6),
  correctCount: z.number().int().min(0).max(6),
});

export type DifficultyKey = z.infer<typeof leaderboardSubmissionSchema>["difficulty"];

export function normalizeLeaderboardName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function confirmedGameRoute(
  level: DifficultyKey,
  playerName: string,
): string | null {
  if (!normalizeLeaderboardName(playerName)) return null;
  return `/brew?level=${encodeURIComponent(level)}`;
}

export type RankedLeaderboardEntry = {
  id: number;
  score: number;
  createdAt: Date | string;
};

export function topTenLeaderboardEntries<T extends RankedLeaderboardEntry>(
  entries: readonly T[],
): T[] {
  return [...entries]
    .sort((left, right) => {
      const scoreOrder = right.score - left.score;
      if (scoreOrder !== 0) return scoreOrder;
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return leftTime - rightTime || left.id - right.id;
    })
    .slice(0, 10);
}
