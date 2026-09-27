CREATE TABLE `leaderboard_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`difficulty` enum('easy','normal','hard') NOT NULL,
	`playerName` varchar(24) NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`stages` int NOT NULL DEFAULT 0,
	`correctCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leaderboard_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `leaderboard_difficulty_score_idx` ON `leaderboard_entries` (`difficulty`,`score`);