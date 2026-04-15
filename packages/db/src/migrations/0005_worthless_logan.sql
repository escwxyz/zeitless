ALTER TABLE `orders` ADD `stripe_checkout_session_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `stripe_payment_intent_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `stripe_refund_id` text;--> statement-breakpoint
