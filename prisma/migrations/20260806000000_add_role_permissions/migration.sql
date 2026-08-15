-- CreateTable
CREATE TABLE `RolePermission` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `permission` VARCHAR(100) NOT NULL,

    INDEX `RolePermission_roleId_idx`(`roleId`),
    UNIQUE INDEX `RolePermission_roleId_permission_key`(`roleId`, `permission`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
