/*
  Warnings:

  - You are about to drop the column `read` on the `notification` table. All the data in the column will be lost.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` DROP COLUMN `read`,
    ADD COLUMN `isRead` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `type` VARCHAR(255) NOT NULL;
