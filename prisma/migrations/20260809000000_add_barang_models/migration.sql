-- CreateTable
CREATE TABLE `barang` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `hargaBeli` DOUBLE NULL,
    `hargaJual` DOUBLE NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `lokasi` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `barang_transaksi` (
    `id` VARCHAR(191) NOT NULL,
    `barangId` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jenis` VARCHAR(10) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `keterangan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `barang_transaksi_barangId_idx`(`barangId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `barang_transaksi` ADD CONSTRAINT `barang_transaksi_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
