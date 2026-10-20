CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`town_id` integer NOT NULL,
	`discord_user_id` text NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`last_checkin_at` integer,
	`last_visit_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT `fk_players_town_id_towns_id_fk` FOREIGN KEY (`town_id`) REFERENCES `towns`(`id`)
);
--> statement-breakpoint
CREATE TABLE `towns` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`guild_id` text NOT NULL UNIQUE,
	`grid_width` integer NOT NULL,
	`grid_height` integer NOT NULL,
	`reset_hour` integer DEFAULT 6 NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`digest_channel_id` text,
	`current_season` text,
	`settings` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_town_user_idx` ON `players` (`town_id`,`discord_user_id`);