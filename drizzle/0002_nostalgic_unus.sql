ALTER TABLE `conversations` DROP FOREIGN KEY `conversations_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `conversations` MODIFY COLUMN `userId` int;