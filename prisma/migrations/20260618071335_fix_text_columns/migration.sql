-- AlterTable
ALTER TABLE `alumni` MODIFY `testimonial` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `contact` MODIFY `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `page` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `post` MODIFY `content` TEXT NOT NULL,
    MODIFY `excerpt` TEXT NULL;

-- AlterTable
ALTER TABLE `setting` MODIFY `value` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `siteprofile` MODIFY `description` TEXT NULL,
    MODIFY `vision` TEXT NULL,
    MODIFY `mission` TEXT NULL,
    MODIFY `about` TEXT NULL,
    MODIFY `history` TEXT NULL;
