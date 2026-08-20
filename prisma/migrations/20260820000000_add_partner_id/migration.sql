-- AlterTable
ALTER TABLE `Partner` ADD COLUMN `partnerId` VARCHAR(20) NULL;

-- CreateIndex (unique)
CREATE UNIQUE INDEX `Partner_partnerId_key` ON `Partner`(`partnerId`);
