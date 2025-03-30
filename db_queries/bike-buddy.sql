CREATE DATABASE bike_buddy;
DROP DATABASE bike_buddy;

-- User Table
CREATE TABLE `User` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fullName` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `contact` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `profilePictureUrl` VARCHAR(500),
  `verifyCode` VARCHAR(255),
  `verifyCodeExpiryDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `isVerified` BOOLEAN DEFAULT FALSE,
  `role` ENUM('customer', 'owner', 'admin') NOT NULL DEFAULT 'customer',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Message Table
CREATE TABLE `Message` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `content` TEXT  NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `userId` INT,
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Bike Table
CREATE TABLE `Bike` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bikeName` VARCHAR(255) NOT NULL,
    `bikeDescription` TEXT NOT NULL,
    `bikeLocation` VARCHAR(255) NOT NULL,
    `pricePerHour` DECIMAL(10,2) NOT NULL,
    `available` BOOLEAN DEFAULT TRUE,
    `ownerId` INT NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- BikeImage Table (To store multiple images per bike)
CREATE TABLE `BikeImage` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `url` VARCHAR(500) NOT NULL,
    `bikeId` INT NOT NULL,
    FOREIGN KEY (`bikeId`) REFERENCES `Bike`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Booking Table
CREATE TABLE `Booking` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `startTime` TIMESTAMP NOT NULL,
    `endTime` TIMESTAMP NOT NULL,
    `totalPrice` FLOAT NOT NULL,
    `status` ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `paymentReference` VARCHAR(255),
    `customerId` INT NOT NULL,
    `bikeId` INT NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`bikeId`) REFERENCES `Bike`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Review Table
CREATE TABLE `Review` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `rating` ENUM('1', '2', '3', '4', '5') NOT NULL DEFAULT '5',
    `comment` TEXT NOT NULL,
    `customerId` INT NOT NULL,
    `bikeId` INT NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`bikeId`) REFERENCES `Bike`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE `User`
ADD COLUMN `role` VARCHAR(255);


use bike_buddy;
SELECT * FROM `User`;
SELECT * FROM `Bike`;
SELECT * FROM `BikeImage`;
SELECT * FROM `Booking`;
SELECT * FROM `Review`;
SELECT * FROM `Notification`;

INSERT INTO `User` (`id`, `fullName`, `email`, `contact`, `password`, `role`)
VALUES (1, "Subham Adhikari", "bikebuddy_admin@gmail.com", "9876543210", "admin@123", "admin");