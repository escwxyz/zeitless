CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`email` text NOT NULL,
	`items` text NOT NULL,
	`total_price` integer NOT NULL,
	`currency` text NOT NULL,
	`status` text DEFAULT 'reserved' NOT NULL,
	`shipping_info` text NOT NULL,
	`reserved_at` integer NOT NULL,
	`reserved_until` integer NOT NULL,
	`paid_at` integer,
	`cancelled_at` integer,
	`tracking_carrier` text,
	`tracking_number` text,
	`internal_notes` text,
	`refund_reason` text
);
--> statement-breakpoint
CREATE INDEX `order_email_idx` ON `order` (`email`);--> statement-breakpoint
CREATE INDEX `order_status_idx` ON `order` (`status`);--> statement-breakpoint
CREATE INDEX `order_reserved_until_idx` ON `order` (`reserved_until`);--> statement-breakpoint
CREATE INDEX `order_created_at_idx` ON `order` (`created_at`);--> statement-breakpoint
CREATE TABLE `product` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`title` text NOT NULL,
	`brand` text NOT NULL,
	`category` text NOT NULL,
	`condition` text NOT NULL,
	`size` text NOT NULL,
	`price` integer NOT NULL,
	`currency` text NOT NULL,
	`description` text NOT NULL,
	`images` text NOT NULL,
	`is_sold` integer DEFAULT false NOT NULL,
	`reservation_status` text DEFAULT 'available' NOT NULL,
	`reserved_until` integer,
	`draft` integer DEFAULT true NOT NULL,
	`cost_price` integer,
	`internal_notes` text,
	`internal_tags` text NOT NULL,
	`published_at` integer,
	`updated_by` text,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `product_brand_idx` ON `product` (`brand`);--> statement-breakpoint
CREATE INDEX `product_category_idx` ON `product` (`category`);--> statement-breakpoint
CREATE INDEX `product_condition_idx` ON `product` (`condition`);--> statement-breakpoint
CREATE INDEX `product_draft_idx` ON `product` (`draft`);--> statement-breakpoint
CREATE INDEX `product_reservation_status_idx` ON `product` (`reservation_status`);--> statement-breakpoint
CREATE INDEX `product_published_at_idx` ON `product` (`published_at`);--> statement-breakpoint
CREATE INDEX `product_created_at_idx` ON `product` (`created_at`);--> statement-breakpoint
CREATE TABLE `reservation` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`product_id` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'reserved' NOT NULL,
	`reserved_until` integer NOT NULL,
	`released_at` integer,
	`cart_id` text,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reservation_product_id_idx` ON `reservation` (`product_id`);--> statement-breakpoint
CREATE INDEX `reservation_email_idx` ON `reservation` (`email`);--> statement-breakpoint
CREATE INDEX `reservation_status_idx` ON `reservation` (`status`);--> statement-breakpoint
CREATE INDEX `reservation_reserved_until_idx` ON `reservation` (`reserved_until`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);