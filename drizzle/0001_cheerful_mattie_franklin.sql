CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`storeId` int NOT NULL,
	`currentPrice` decimal(10,2) NOT NULL,
	`shippingCost` decimal(10,2) NOT NULL DEFAULT '0',
	`deliveryDays` int NOT NULL DEFAULT 7,
	`warrantyMonths` int NOT NULL DEFAULT 12,
	`listPrice` decimal(10,2),
	`url` varchar(500),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`storeId` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`recordedAt` timestamp NOT NULL,
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`name` varchar(200) NOT NULL,
	`brand` varchar(80) NOT NULL,
	`category` enum('smartphones','notebooks','tvs','eletrodomesticos') NOT NULL,
	`shortDescription` text,
	`imageEmoji` varchar(8) NOT NULL DEFAULT '📦',
	`referencePrice` decimal(10,2) NOT NULL,
	`specs` json NOT NULL,
	`promoMonths` json NOT NULL,
	`popularity` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `specDictionary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`term` varchar(120) NOT NULL,
	`plainLanguage` text NOT NULL,
	CONSTRAINT `specDictionary_id` PRIMARY KEY(`id`),
	CONSTRAINT `specDictionary_term_unique` UNIQUE(`term`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`logoEmoji` varchar(8) NOT NULL DEFAULT '🛒',
	`reclameAquiScore` decimal(3,1) NOT NULL,
	`proconScore` decimal(3,1) NOT NULL,
	`userScore` decimal(3,1) NOT NULL,
	`totalReviews` int NOT NULL DEFAULT 0,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `offers_product_idx` ON `offers` (`productId`);--> statement-breakpoint
CREATE INDEX `offers_store_idx` ON `offers` (`storeId`);--> statement-breakpoint
CREATE INDEX `priceHistory_product_idx` ON `priceHistory` (`productId`);--> statement-breakpoint
CREATE INDEX `priceHistory_product_store_idx` ON `priceHistory` (`productId`,`storeId`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `products_brand_idx` ON `products` (`brand`);