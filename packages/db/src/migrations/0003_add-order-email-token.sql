ALTER TABLE `order` ADD `email_token` text;--> statement-breakpoint
CREATE UNIQUE INDEX `order_email_token_unique` ON `order` (`email_token`);